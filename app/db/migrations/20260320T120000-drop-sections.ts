import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("postSections").execute();
  await db.schema.dropTable("sections").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("sections")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable("postSections")
    .addColumn("postId", "uuid", (col) => col.notNull().references("posts.id"))
    .addColumn("sectionId", "uuid", (col) => col.notNull().references("sections.id"))
    .addPrimaryKeyConstraint("postSectionsPkey", ["postId", "sectionId"])
    .execute();
}
