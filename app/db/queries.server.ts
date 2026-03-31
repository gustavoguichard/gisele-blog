import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { getDb } from "./db.server";

const slugSchema = z.object({ slug: z.string().min(1) });
const wpIdSchema = z.object({ wpId: z.coerce.number().int().positive() });
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

const PER_PAGE = 10;

const postsBaseQuery = () => getDb().selectFrom("posts").where("status", "=", "published");

export const fetchRecentPosts = composable(async (limit = 6) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .execute();
});

export const fetchPostsPaginated = applySchema(paginationSchema)(async ({ page }) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .execute();
});

export const fetchPostsCount = composable(async () => {
  const result = await postsBaseQuery()
    .select(sql<number>`count(*)::int`.as("count"))
    .executeTakeFirstOrThrow();
  return result.count;
});

export const fetchPostBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return postsBaseQuery().where("slug", "=", slug).selectAll().executeTakeFirstOrThrow();
});

export const fetchTagsForPost = composable(async (postId: string) => {
  return getDb()
    .selectFrom("tags")
    .innerJoin("postTags", "postTags.tagId", "tags.id")
    .where("postTags.postId", "=", postId)
    .select(["tags.id", "tags.name", "tags.slug"])
    .execute();
});

export const fetchCommentsForPost = composable(async (postId: string) => {
  const comments = await getDb()
    .selectFrom("comments")
    .where("postId", "=", postId)
    .where("status", "=", "published")
    .selectAll()
    .orderBy("createdAt", "asc")
    .execute();
  return comments.map((c) => ({
    ...c,
    content: sanitizeHtml(c.content),
  }));
});

const insertCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().max(254),
  content: z.string().min(1).max(5000),
});

export const insertComment = applySchema(insertCommentSchema)(async ({
  postId,
  parentId,
  authorName,
  authorEmail,
  content,
}) => {
  return getDb()
    .insertInto("comments")
    .values({
      postId,
      parentId,
      authorName: authorName.trim(),
      authorEmail,
      content: content.trim().replace(/\n/g, "<br>"),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
});

export const fetchTestimonials = composable(async () => {
  return getDb()
    .selectFrom("testimonials")
    .where("status", "=", "published")
    .select(["id", "author", "content", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .execute();
});

export const fetchWorks = composable(async () => {
  return getDb()
    .selectFrom("works")
    .where("status", "=", "published")
    .select(["id", "title", "slug", "content", "excerpt", "featuredImage"])
    .orderBy("createdAt", "desc")
    .execute();
});

export const fetchWorkBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("works")
    .where("slug", "=", slug)
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
});

export const fetchPostByWpId = applySchema(wpIdSchema)(async ({ wpId }) => {
  const post = await getDb()
    .selectFrom("posts")
    .where("wpOriginalId", "=", wpId)
    .where("status", "=", "published")
    .select(["slug"])
    .executeTakeFirst();

  if (post) return { slug: post.slug, type: "post" as const };

  const work = await getDb()
    .selectFrom("works")
    .where("wpOriginalId", "=", wpId)
    .where("status", "=", "published")
    .select(["slug"])
    .executeTakeFirst();

  if (work) return { slug: work.slug, type: "course" as const };

  throw new Error("Not found");
});

export const fetchTagsWithCounts = composable(async () => {
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

const tagPaginationSchema = z.object({
  slug: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
});

export const fetchPostsByTagPaginated = applySchema(tagPaginationSchema)(async ({ slug, page }) => {
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

export const fetchPostsByTagCount = applySchema(slugSchema)(async ({ slug }) => {
  const result = await postsBaseQuery()
    .innerJoin("postTags", "postTags.postId", "posts.id")
    .innerJoin("tags", "tags.id", "postTags.tagId")
    .where("tags.slug", "=", slug)
    .select(sql<number>`count(*)::int`.as("count"))
    .executeTakeFirstOrThrow();
  return result.count;
});

export const fetchTagBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("tags")
    .where("slug", "=", slug)
    .select(["id", "name", "slug"])
    .executeTakeFirstOrThrow();
});

export const fetchSitemapEntries = composable(async () => {
  const posts = await postsBaseQuery().select(["slug", "updatedAt"]).execute();
  const works = await getDb()
    .selectFrom("works")
    .where("status", "=", "published")
    .select(["slug", "updatedAt"])
    .execute();

  return [
    ...posts.map((p) => ({ ...p, type: "post" as const })),
    ...works.map((w) => ({ ...w, type: "work" as const })),
  ];
});

export const fetchPostsForFeed = composable(async (limit = 30) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "content", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .execute();
});

export { PER_PAGE };
