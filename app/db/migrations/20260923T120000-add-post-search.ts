import type { Kysely } from "kysely";
import { sql } from "kysely";

const SEARCHABLE_TABLES = ["posts", "works"] as const;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS unaccent`.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION immutable_unaccent(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent', $1) $$
  `.execute(db);

  for (const table of SEARCHABLE_TABLES) {
    await db.schema
      .alterTable(table)
      .addColumn("searchText", "text", (col) =>
        col
          .generatedAlwaysAs(
            sql`immutable_unaccent(title || ' ' || coalesce(excerpt, '') || ' ' || regexp_replace(content, '<[^>]*>', ' ', 'g'))`,
          )
          .stored(),
      )
      .execute();
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const table of SEARCHABLE_TABLES) {
    await db.schema.alterTable(table).dropColumn("searchText").execute();
  }
  await sql`DROP FUNCTION IF EXISTS immutable_unaccent(text)`.execute(db);
  await sql`DROP EXTENSION IF EXISTS unaccent`.execute(db);
  await sql`DROP EXTENSION IF EXISTS pg_trgm`.execute(db);
}
