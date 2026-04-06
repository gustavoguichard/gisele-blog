import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "~/db/db.server";

const PER_PAGE = 10;

const slugSchema = z.object({ slug: z.string().min(1) });
const tagPaginationSchema = z.object({
  slug: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
});

const postsBaseQuery = () => getDb().selectFrom("posts").where("status", "=", "published");

const fetchTagsForPost = composable(async (postId: string) => {
  return getDb()
    .selectFrom("tags")
    .innerJoin("postTags", "postTags.tagId", "tags.id")
    .where("postTags.postId", "=", postId)
    .select(["tags.id", "tags.name", "tags.slug"])
    .execute();
});

const fetchTagsWithCounts = composable(async () => {
  return getDb()
    .selectFrom("tags")
    .innerJoin("postTags", "postTags.tagId", "tags.id")
    .innerJoin("posts", (join) =>
      join.onRef("posts.id", "=", "postTags.postId").on("posts.status", "=", "published"),
    )
    .select(["tags.id", "tags.name", "tags.slug"])
    .select(sql<number>`count(*)::int`.as("postCount"))
    .groupBy(["tags.id", "tags.name", "tags.slug"])
    .orderBy("postCount", "desc")
    .execute();
});

const fetchTagBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("tags")
    .where("slug", "=", slug)
    .select(["id", "name", "slug"])
    .executeTakeFirstOrThrow();
});

const fetchPostsByTagPaginated = applySchema(tagPaginationSchema)(async ({ slug, page }) => {
  return postsBaseQuery()
    .innerJoin("postTags", "postTags.postId", "posts.id")
    .innerJoin("tags", "tags.id", "postTags.tagId")
    .where("tags.slug", "=", slug)
    .select([
      "posts.id",
      "posts.title",
      "posts.slug",
      "posts.excerpt",
      "posts.featuredImage",
      "posts.publishedAt",
    ])
    .orderBy("posts.publishedAt", "desc")
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .execute();
});

const fetchPostsByTagCount = applySchema(slugSchema)(async ({ slug }) => {
  const result = await postsBaseQuery()
    .innerJoin("postTags", "postTags.postId", "posts.id")
    .innerJoin("tags", "tags.id", "postTags.tagId")
    .where("tags.slug", "=", slug)
    .select(sql<number>`count(*)::int`.as("count"))
    .executeTakeFirstOrThrow();
  return result.count;
});

export {
  fetchPostsByTagCount,
  fetchPostsByTagPaginated,
  fetchTagBySlug,
  fetchTagsForPost,
  fetchTagsWithCounts,
};
