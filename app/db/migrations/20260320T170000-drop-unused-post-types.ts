import type { Kysely } from "kysely";
import { sql } from "kysely";

const TYPES_TO_REMOVE = ["presentation", "video", "event", "album"] as const;

export async function up(db: Kysely<any>): Promise<void> {
  for (const postType of TYPES_TO_REMOVE) {
    await db
      .deleteFrom("comments")
      .where("postId", "in", db.selectFrom("posts").select("id").where("postType", "=", postType))
      .execute();

    await db
      .deleteFrom("postTags")
      .where("postId", "in", db.selectFrom("posts").select("id").where("postType", "=", postType))
      .execute();

    await db.deleteFrom("posts").where("postType", "=", postType).execute();
  }

  await sql`ALTER TABLE posts ALTER COLUMN post_type DROP DEFAULT`.execute(db);
  await sql`ALTER TYPE post_type RENAME TO post_type_old`.execute(db);
  await sql`CREATE TYPE post_type AS ENUM ('post', 'page', 'testimonial', 'course')`.execute(db);
  await sql`ALTER TABLE posts ALTER COLUMN post_type TYPE post_type USING post_type::text::post_type`.execute(
    db,
  );
  await sql`ALTER TABLE posts ALTER COLUMN post_type SET DEFAULT 'post'`.execute(db);
  await sql`DROP TYPE post_type_old`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE posts ALTER COLUMN post_type DROP DEFAULT`.execute(db);
  await sql`ALTER TYPE post_type RENAME TO post_type_old`.execute(db);
  await sql`CREATE TYPE post_type AS ENUM ('post', 'page', 'testimonial', 'video', 'event', 'album', 'course', 'presentation')`.execute(
    db,
  );
  await sql`ALTER TABLE posts ALTER COLUMN post_type TYPE post_type USING post_type::text::post_type`.execute(
    db,
  );
  await sql`ALTER TABLE posts ALTER COLUMN post_type SET DEFAULT 'post'`.execute(db);
  await sql`DROP TYPE post_type_old`.execute(db);
}
