import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "~/db/db.server";

const PER_PAGE = 10;

const slugSchema = z.object({ slug: z.string().min(1) });
const wpIdSchema = z.object({ wpId: z.coerce.number().int().positive() });
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

const postsBaseQuery = () => getDb().selectFrom("posts").where("status", "=", "published");

const fetchRecentPosts = composable(async (limit = 6) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .execute();
});

const fetchPostsPaginated = applySchema(paginationSchema)(async ({ page }) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .execute();
});

const fetchPostsCount = composable(async () => {
  const result = await postsBaseQuery()
    .select(sql<number>`count(*)::int`.as("count"))
    .executeTakeFirstOrThrow();
  return result.count;
});

const fetchPostBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return postsBaseQuery().where("slug", "=", slug).selectAll().executeTakeFirstOrThrow();
});

const fetchPostByWpId = applySchema(wpIdSchema)(async ({ wpId }) => {
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

const fetchPostsForFeed = composable(async (limit = 30) => {
  return postsBaseQuery()
    .select(["id", "title", "slug", "excerpt", "content", "featuredImage", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .execute();
});

const fetchSitemapEntries = composable(async () => {
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

export {
  fetchPostBySlug,
  fetchPostByWpId,
  fetchPostsCount,
  fetchPostsForFeed,
  fetchPostsPaginated,
  fetchRecentPosts,
  fetchSitemapEntries,
  PER_PAGE,
};
