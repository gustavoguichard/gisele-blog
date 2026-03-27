import type { Kysely } from "kysely";
import { sql } from "kysely";

const DEAD_LINK_RE =
  /<a[^>]*href="https?:\/\/(?:www\.)?giseledemenezes\.com(?:\/(?:especializacao|album|banner|video|contato|img)\/[^"]*|\/[^"]*\.pdf|\?(?:attachment_id|page_id|video)=[^"]*)"[^>]*>(.*?)<\/a>/gi;

const DEAD_IMG_RE =
  /<img[^>]*src="https?:\/\/(?:www\.)?giseledemenezes\.com\/img\/[^"]*"[^>]*\/?>/gi;

const CURSO_HREF_RE = /href="https?:\/\/(?:www\.)?giseledemenezes\.com\/curso\//g;

const DOMAIN_HREF_RE = /href="https?:\/\/(?:www\.)?giseledemenezes\.com(\/[^"]*)"/g;

const HOME_HREF_RE = /href="https?:\/\/(?:www\.)?giseledemenezes\.com\/?"/g;

const WP_UPLOADS_SRC_RE =
  /src="https?:\/\/(?:www\.)?giseledemenezes\.com\/wp-content\/uploads\/([^"]*)"/g;

export async function up(db: Kysely<never>): Promise<void> {
  const posts = await sql<{ id: string; content: string }>`
    SELECT id, content FROM posts WHERE content ~ 'giseledemenezes\\.com'
  `.execute(db);

  for (const post of posts.rows) {
    let content = post.content;

    content = content.replace(DEAD_LINK_RE, "$1");

    content = content.replace(DEAD_IMG_RE, "");

    content = content.replace(WP_UPLOADS_SRC_RE, (_match, path: string) => {
      const webpPath = path.replace(/\.\w+$/, ".webp").replace(/-\d+x\d+\.webp$/, ".webp");
      return `src="/uploads/${webpPath}"`;
    });

    content = content.replace(CURSO_HREF_RE, 'href="/cursos/');

    content = content.replace(DOMAIN_HREF_RE, 'href="$1"');

    content = content.replace(HOME_HREF_RE, 'href="/"');

    if (content !== post.content) {
      await sql`UPDATE posts SET content = ${content} WHERE id = ${post.id}`.execute(db);
    }
  }
}

export async function down(_db: Kysely<never>): Promise<void> {}
