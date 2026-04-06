import { applySchema, composable } from "composable-functions";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { getDb } from "~/db/db.server";

const insertCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().max(254),
  content: z.string().min(1).max(5000),
});

const fetchCommentsForPost = composable(async (postId: string) => {
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

const insertComment = applySchema(insertCommentSchema)(async ({
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

export { fetchCommentsForPost, insertComment };
