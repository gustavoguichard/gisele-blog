import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await sql`UPDATE posts SET status = 'draft' WHERE status = 'pending'`.execute(db);
  await sql`UPDATE works SET status = 'draft' WHERE status = 'pending'`.execute(db);

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();

  await sql`DROP TYPE post_status`.execute(db);
  await sql`CREATE TYPE post_status AS ENUM ('draft', 'published')`.execute(db);

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDataType(sql`post_status USING status::post_status`))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDataType(sql`post_status USING status::post_status`))
    .execute();

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDefault("published"))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDefault("published"))
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();

  await sql`DROP TYPE post_status`.execute(db);
  await sql`CREATE TYPE post_status AS ENUM ('draft', 'pending', 'published')`.execute(db);

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDataType(sql`post_status USING status::post_status`))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDataType(sql`post_status USING status::post_status`))
    .execute();

  await db.schema
    .alterTable("posts")
    .alterColumn("status", (col) => col.setDefault("published"))
    .execute();
  await db.schema
    .alterTable("works")
    .alterColumn("status", (col) => col.setDefault("published"))
    .execute();
}
