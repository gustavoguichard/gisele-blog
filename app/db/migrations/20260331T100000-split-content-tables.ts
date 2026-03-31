import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await sql`CREATE TYPE testimonial_status AS ENUM ('draft', 'published')`.execute(db);

  await db.schema
    .createTable("works")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("content", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("excerpt", "text")
    .addColumn("featured_image", "text")
    .addColumn("status", sql`post_status`, (col) => col.notNull().defaultTo("published"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("wp_original_id", "integer")
    .execute();

  await db.schema
    .createTable("testimonials")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("author", "text", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("status", sql`testimonial_status`, (col) => col.notNull().defaultTo("published"))
    .addColumn("published_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`
    INSERT INTO works (id, title, slug, content, excerpt, featured_image, status, created_at, updated_at, wp_original_id)
    SELECT id, title, slug, content, excerpt, featured_image, status, created_at, updated_at, wp_original_id
    FROM posts WHERE post_type = 'course'
  `.execute(db);

  await sql`
    INSERT INTO testimonials (id, author, content, status, published_at, created_at)
    SELECT id, title, content, status::text::testimonial_status, published_at, created_at
    FROM posts WHERE post_type = 'testimonial'
  `.execute(db);

  await sql`DELETE FROM posts WHERE post_type IN ('course', 'testimonial', 'page')`.execute(db);

  await sql`DELETE FROM comments WHERE status = 'rejected'`.execute(db);
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();
  await sql`DROP TYPE comment_status`.execute(db);
  await sql`CREATE TYPE comment_status AS ENUM ('pending', 'published')`.execute(db);
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) =>
      col.setDataType(sql`comment_status USING status::comment_status`),
    )
    .execute();
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.setDefault("pending"))
    .execute();

  await db.schema
    .alterTable("posts")
    .alterColumn("post_type", (col) => col.dropDefault())
    .execute();
  await db.schema.alterTable("posts").dropColumn("post_type").execute();
  await sql`DROP TYPE post_type`.execute(db);
}

export async function down(db: Kysely<never>): Promise<void> {
  await sql`CREATE TYPE post_type AS ENUM ('post', 'page', 'testimonial', 'course')`.execute(db);
  await db.schema
    .alterTable("posts")
    .addColumn("post_type", sql`post_type`, (col) => col.notNull().defaultTo("post"))
    .execute();

  await sql`
    INSERT INTO posts (id, title, slug, content, excerpt, featured_image, status, published_at, created_at, updated_at, wp_original_id, post_type)
    SELECT id, title, slug, content, excerpt, featured_image, status, null, created_at, updated_at, wp_original_id, 'course'::post_type
    FROM works
  `.execute(db);

  await sql`
    INSERT INTO posts (id, title, slug, content, excerpt, status, published_at, created_at, post_type)
    SELECT id, author, content, '', status::text::post_status, published_at, created_at, 'testimonial'::post_type
    FROM testimonials
  `.execute(db);

  await db.schema.dropTable("works").execute();
  await db.schema.dropTable("testimonials").execute();
  await sql`DROP TYPE testimonial_status`.execute(db);

  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.dropDefault())
    .execute();
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.setDataType("text"))
    .execute();
  await sql`DROP TYPE comment_status`.execute(db);
  await sql`CREATE TYPE comment_status AS ENUM ('pending', 'published', 'rejected')`.execute(db);
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) =>
      col.setDataType(sql`comment_status USING status::comment_status`),
    )
    .execute();
  await db.schema
    .alterTable("comments")
    .alterColumn("status", (col) => col.setDefault("pending"))
    .execute();
}
