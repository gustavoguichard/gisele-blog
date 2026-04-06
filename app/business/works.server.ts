import { applySchema, composable } from "composable-functions";
import { z } from "zod";
import { getDb } from "~/db/db.server";

const slugSchema = z.object({ slug: z.string().min(1) });

const fetchWorks = composable(async () => {
  return getDb()
    .selectFrom("works")
    .where("status", "=", "published")
    .select(["id", "title", "slug", "content", "excerpt", "featuredImage"])
    .orderBy("createdAt", "desc")
    .execute();
});

const fetchWorkBySlug = applySchema(slugSchema)(async ({ slug }) => {
  return getDb()
    .selectFrom("works")
    .where("slug", "=", slug)
    .where("status", "=", "published")
    .selectAll()
    .executeTakeFirstOrThrow();
});

export { fetchWorkBySlug, fetchWorks };
