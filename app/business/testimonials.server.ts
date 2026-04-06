import { composable } from "composable-functions";
import { getDb } from "~/db/db.server";

const fetchTestimonials = composable(async () => {
  return getDb()
    .selectFrom("testimonials")
    .where("status", "=", "published")
    .select(["id", "author", "content", "publishedAt"])
    .orderBy("publishedAt", "desc")
    .execute();
});

export { fetchTestimonials };
