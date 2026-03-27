import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE comment_status AS ENUM ('published', 'pending', 'rejected')`.execute(db);
  await sql`ALTER TABLE comments ADD COLUMN status comment_status NOT NULL DEFAULT 'published'`.execute(
    db,
  );
  await sql`ALTER TABLE comments ALTER COLUMN status SET DEFAULT 'pending'`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE comments DROP COLUMN status`.execute(db);
  await sql`DROP TYPE comment_status`.execute(db);
}
