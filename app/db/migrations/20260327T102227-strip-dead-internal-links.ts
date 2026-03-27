import type { Kysely } from "kysely";
import { sql } from "kysely";

const PAGE_268_RE = /<a[^>]*href="\/\?page_id=268"[^>]*>(.*?)<\/a>/gi;

const DEAD_LINK_RE =
  /<a[^>]*href="\/\?(?:page_id=(?:847|849)|attachment_id=\d+|video=[^"]*)"[^>]*>(.*?)<\/a>/gi;

const LOCALHOST_RE = /<a[^>]*href="http:\/\/localhost[^"]*"[^>]*>(.*?)<\/a>/gi;

export async function up(db: Kysely<never>): Promise<void> {
  const posts = await sql<{ id: string; content: string }>`
    SELECT id, content FROM posts
    WHERE content ~ '\\?page_id=' OR content ~ '\\?attachment_id=' OR content ~ '\\?video=' OR content ~ 'localhost'
  `.execute(db);

  for (const post of posts.rows) {
    let content = post.content;

    content = content.replace(PAGE_268_RE, '<a href="/sobre">$1</a>');
    content = content.replace(DEAD_LINK_RE, "$1");
    content = content.replace(LOCALHOST_RE, "$1");

    if (content !== post.content) {
      await sql`UPDATE posts SET content = ${content} WHERE id = ${post.id}`.execute(db);
    }
  }
}

export async function down(_db: Kysely<never>): Promise<void> {}
