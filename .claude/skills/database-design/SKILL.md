---
name: database-design
description: Design database tables and migrations following project conventions. Use when creating new tables, writing migrations, adding columns, or discussing database schema design.
---

# Database Design

ALWAYS load the "kysely" skill before anything else. Follow these principles when designing database tables and writing migrations for this project.

## Always use `timestamptz`

All timestamp columns must use `timestamptz` (timestamp with time zone), never `timestamp`. The same applies to `timetz` over `time` if time columns are ever needed.

`timestamp` stores a "wall clock" value with no timezone context — the same value can mean different instants depending on the session's `timezone` setting. `timestamptz` stores an unambiguous instant in time (internally UTC), and PostgreSQL automatically converts to/from the session timezone on input/output. This prevents bugs when servers, clients, or sessions use different timezone settings.

Instead of:

```typescript
.addColumn('createdAt', 'timestamp', (col) =>
  col.defaultTo(sql`now()`).notNull(),
)
```

Do:

```typescript
.addColumn('createdAt', 'timestamptz', (col) =>
  col.defaultTo(sql`now()`).notNull(),
)
```

## No nullable columns

Every column in every table must be non-nullable. If data isn't available at insert time, it belongs in a separate event table that gets created when that data becomes available.

Instead of:

```
titles
  id          UUID NOT NULL
  markdown    TEXT          -- nullable, filled after OCR
```

Do:

```
titles
  id          UUID NOT NULL

title_ocr_results
  id          UUID NOT NULL
  title_id    UUID NOT NULL (FK)
  markdown    TEXT NOT NULL
  created_at  TIMESTAMPTZ NOT NULL
```

## No `updatedAt` columns

Never add `updatedAt` to any table. When a timestamp for a state change is needed, create a record in an event table instead. The event's `createdAt` serves as the timestamp for when the change occurred.

Instead of:

```
titles
  id          UUID NOT NULL
  status      TEXT NOT NULL
  updated_at  TIMESTAMP NOT NULL  -- tracks when status changed
```

Do:

```
titles
  id          UUID NOT NULL
  status      TEXT NOT NULL

title_intakes
  id          UUID NOT NULL
  title_id    UUID NOT NULL (FK)
  status      TEXT NOT NULL
  created_at  TIMESTAMPTZ NOT NULL  -- this IS the timestamp
```

## Event tables over nullable columns

As a process progresses through stages, create separate tables for each event rather than updating nullable columns on a parent record. Each event table has its own non-nullable data relevant to that event.

Example for a multi-step pipeline:

```
plot_summaries                    -- main entity
  id, original_filename, created_at

plot_summary_intakes              -- each intake attempt
  id, plot_summary_id, created_at

plot_summary_intake_successes     -- many per intake (reruns allowed)
  id, plot_summary_intake_id, temp_s3_key, created_at

plot_summary_intake_failures      -- many per intake (retries)
  id, plot_summary_intake_id, step, error_message, created_at
```

Status is derived from child records, not stored (see "No derivable columns" below). This pattern extends to each pipeline stage: OCR results, title identifications, etc. Each gets its own event table with non-nullable, stage-specific data.

## No derivable columns

Never store a column whose value can be inferred from the existence of child/event records. If a status is always set alongside inserting an event record, the event record _is_ the status — the column is redundant and creates sync risk.

Instead of:

```
plot_summary_intakes
  id, plot_summary_id, status, created_at
  -- status is 'pending' | 'succeeded' | 'failed'
  -- updated to 'succeeded' when a success record is inserted
  -- updated to 'failed' when a failure record is inserted
```

Do:

```
plot_summary_intakes
  id, plot_summary_id, created_at
  -- status derived: success record exists → succeeded
  --                  failure record exists → failed
  --                  neither exists        → pending
```

Derive status at query time using `CASE WHEN ... EXISTS` subqueries or joins when the UI or business logic needs it. Only build the derivation query when actually needed.

## No unique constraints on event table FKs

Event tables (successes, failures, results) must never have unique constraints on the parent foreign key. Allow multiple records per parent so that steps can be rerun and historical results are preserved. The latest record by `createdAt` represents the current state.

Instead of:

```typescript
.addColumn('plotSummaryIntakeId', 'uuid', (col) =>
  col.notNull().unique().references('plotSummaryIntakes.id'),
)
```

Do:

```typescript
.addColumn('plotSummaryIntakeId', 'uuid', (col) =>
  col.notNull().references('plotSummaryIntakes.id'),
)
```

To query the latest result, order by `createdAt desc` and take the first record.

## Mutable columns are fine — when not derivable

Mutable columns that get updated in place are acceptable, as long as their value can't be inferred from child records. A column that is always updated in tandem with inserting an event record is derivable and should be removed.

## Store full resource locators

When persisting references to external resources (S3 objects, Google Drive files, etc.), store all components needed to locate the resource — not just the key/path. For S3, this means storing the bucket name alongside every S3 key. For Google Drive, it means storing both the file ID and the folder ID.

This makes stored references self-contained. If an environment variable like `AWS_S3_BUCKET` changes, existing records still point to the correct resource.

Instead of:

```
plot_summary_intake_successes
  id            UUID NOT NULL
  temp_s3_key   TEXT NOT NULL
  created_at    TIMESTAMPTZ NOT NULL
```

Do:

```
plot_summary_intake_successes
  id              UUID NOT NULL
  temp_s3_key     TEXT NOT NULL
  temp_s3_bucket  TEXT NOT NULL
  created_at      TIMESTAMPTZ NOT NULL
```

The naming convention pairs each `*S3Key` column with a corresponding `*S3Bucket` column using the same prefix (e.g., `pdfS3Key` / `pdfS3Bucket`, `markdownS3Key` / `markdownS3Bucket`).

## No unnecessary defaults

Only use `defaultTo(...)` for truly auto-generated values like `id` and `createdAt`. When a column has `defaultTo(...)`, Kysely's type generator wraps it in `Generated<T>`, making it optional on insert. This silently loses type safety — forgetting to pass the value won't produce a compiler error.

Instead of:

```typescript
.addColumn('seriesName', 'text', (col) =>
  col.defaultTo('').notNull(),
)
```

Do:

```typescript
.addColumn('seriesName', 'text', (col) =>
  col.notNull(),
)
```

The first generates `seriesName: Generated<string>` (optional on insert). The second generates `seriesName: string` (required on insert), ensuring every insert site is forced to provide the value.

## No cascade deletes

Never use `ON DELETE CASCADE` on foreign keys. Prefer explicit deletes in application code or migrations. Cascade deletes are dangerous because a developer unfamiliar with the schema can accidentally delete large amounts of data by removing a single parent row.

Instead of:

```typescript
.addColumn('resultId', 'uuid', (col) =>
  col.notNull().references('results.id').onDelete('cascade'),
)
```

Do:

```typescript
.addColumn('resultId', 'uuid', (col) =>
  col.notNull().references('results.id'),
)
```

When child records need to be deleted alongside a parent, delete them explicitly in a transaction:

```typescript
await db()
  .transaction()
  .execute(async (trx) => {
    await trx.deleteFrom("childRecords").where("parentId", "=", parentId).execute();
    await trx.deleteFrom("parents").where("id", "=", parentId).execute();
  });
```

## Self-contained migrations

Never import application code (`~/business/`, etc.) in migration files. Migrations are frozen snapshots — they must produce the same result regardless of how the application evolves after they were written.

If a migration needs logic that already exists in the application (e.g., a normalization function for a backfill), duplicate that logic directly inside the migration file. This makes the migration immune to future changes in the imported module.

Instead of:

```typescript
import { buildDedupKey } from "~/business/title-deduplication.server";

export async function up(db: Kysely<any>) {
  // uses buildDedupKey — breaks if the function changes later
}
```

Do:

```typescript
function buildDedupKey(bookName: string, allAuthors: string) {
  return [normalizeMainTitle(bookName), normalizeAuthor(allAuthors)].join(" || ");
}

export async function up(db: Kysely<any>) {
  // uses the local copy — forever frozen
}
```

The only allowed imports in migration files are `kysely` (and its `sql` helper) and Node.js built-in modules.
