import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { getDb } from "./db.server";

const slugSchema = z.object({ slug: z.string().min(1) });
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

const PER_PAGE = 10;

const postsBaseQuery = () =>
  getDb().selectFrom("posts").where("status", "=", "published").where("postType", "=", "post");

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
  return getDb()
    .selectFrom("posts")
    .where("slug", "=", slug)
    .where("postType", "=", "post")
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
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
    .selectAll()
    .orderBy("createdAt", "asc")
    .execute();
  return comments.map((c) => ({
    ...c,
    content: sanitizeHtml(c.content),
  }));
});

export const fetchPageBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("posts")
    .where("slug", "=", slug)
    .where("postType", "=", "page")
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
});

export const fetchTestimonials = composable(async () => {
  return getDb()
    .selectFrom("posts")
    .where("postType", "=", "testimonial")
    .where("status", "=", "published")
    .select(["id", "title", "content", "excerpt", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .execute();
});

export const fetchCourses = composable(async () => {
  return getDb()
    .selectFrom("posts")
    .where("postType", "=", "course")
    .where("status", "=", "published")
    .select(["id", "title", "slug", "content", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .execute();
});

export const fetchCourseBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("posts")
    .where("slug", "=", slug)
    .where("postType", "=", "course")
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
});

export const fetchSitemapEntries = composable(async () => {
  return getDb()
    .selectFrom("posts")
    .where("status", "=", "published")
    .where("postType", "in", ["post", "course"])
    .select(["slug", "postType", "updatedAt"])
    .execute();
});

export { PER_PAGE };
