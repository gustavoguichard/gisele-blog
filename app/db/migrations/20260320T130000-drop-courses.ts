import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("postCourses").execute();
  await db.schema.dropTable("courses").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("courses")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable("postCourses")
    .addColumn("postId", "uuid", (col) => col.notNull().references("posts.id"))
    .addColumn("courseId", "uuid", (col) => col.notNull().references("courses.id"))
    .addPrimaryKeyConstraint("postCoursesPkey", ["postId", "courseId"])
    .execute();
}
