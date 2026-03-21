// @ts-nocheck
import { readFileSync } from "node:fs";
import pg from "pg";
import TurndownService from "turndown";
import { marked } from "marked";

const DB_URL = "postgresql://guga@localhost:5432/gisele_blog";

const POST_TYPE_MAP: Record<string, string> = {
  post: "post",
  page: "page",
  depoimento: "testimonial",
  video: "video",
  evento: "event",
  album: "album",
  curso: "course",
  apresentacao: "presentation",
};

const STATUS_MAP: Record<string, string> = {
  publish: "published",
  draft: "draft",
  pending: "draft",
  private: "draft",
};

const RELEVANT_POST_TYPES = new Set(Object.keys(POST_TYPE_MAP));

const SCHEMA = `
DROP TABLE IF EXISTS post_courses CASCADE;
DROP TABLE IF EXISTS post_sections CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TYPE IF EXISTS post_type CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;

CREATE TYPE post_type AS ENUM ('post', 'page', 'testimonial', 'video', 'event', 'album', 'course', 'presentation');
CREATE TYPE post_status AS ENUM ('published', 'draft', 'pending');

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  featured_image TEXT,
  post_type post_type NOT NULL DEFAULT 'post',
  status post_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wp_original_id INTEGER
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE post_sections (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, section_id)
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE post_courses (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, course_id)
);
`;

// ---------------------------------------------------------------------------
// SQL Parser
// ---------------------------------------------------------------------------

function parseTupleValues(line: string): (string | number)[] {
  let str = line.trim();
  if (str.startsWith("(")) str = str.slice(1);
  if (str.endsWith(");")) str = str.slice(0, -2);
  else if (str.endsWith("),")) str = str.slice(0, -2);
  else if (str.endsWith(")")) str = str.slice(0, -1);

  const values: (string | number)[] = [];
  let i = 0;

  while (i < str.length) {
    while (i < str.length && str[i] === " ") i++;
    if (i >= str.length) break;

    if (str[i] === "'") {
      i++;
      let val = "";
      while (i < str.length) {
        if (str[i] === "\\") {
          i++;
          if (i < str.length) {
            const esc: Record<string, string> = {
              "'": "'",
              "\\": "\\",
              n: "\n",
              r: "\r",
              t: "\t",
              "0": "\0",
            };
            val += esc[str[i]] ?? str[i];
          }
        } else if (str[i] === "'") {
          if (str[i + 1] === "'") {
            val += "'";
            i++;
          } else break;
        } else {
          val += str[i];
        }
        i++;
      }
      i++;
      values.push(val);
    } else if (str.slice(i, i + 4) === "NULL") {
      values.push("");
      i += 4;
    } else {
      let val = "";
      while (i < str.length && str[i] !== ",") {
        val += str[i];
        i++;
      }
      values.push(Number(val.trim()));
    }

    while (i < str.length && (str[i] === "," || str[i] === " ")) {
      if (str[i] === ",") {
        i++;
        break;
      }
      i++;
    }
  }

  return values;
}

function extractInserts(sql: string, tableName: string): (string | number)[][] {
  const lines = sql.split("\n");
  const results: (string | number)[][] = [];
  let inInsert = false;

  for (const line of lines) {
    if (line.startsWith(`INSERT INTO \`${tableName}\``)) {
      inInsert = true;
      continue;
    }
    if (inInsert) {
      const trimmed = line.trim();
      if (trimmed.startsWith("(")) {
        results.push(parseTupleValues(trimmed));
      }
      if (trimmed.endsWith(";")) {
        inInsert = false;
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Content Transformer
// ---------------------------------------------------------------------------

function cleanWpContent(html: string): string {
  let c = html;

  // Strip Gutenberg block comments
  c = c.replace(/<!--\s*\/?wp:[^>]*-->/g, "");

  // [caption] → <figure>
  c = c.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, (_, inner) => {
    const img = inner.match(/<img[^>]+>/)?.[0] ?? "";
    const caption = inner.replace(/<img[^>]+>/, "").trim();
    return `<figure>${img}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
  });

  // [gallery] → placeholder
  c = c.replace(/\[gallery[^\]]*\]/g, "");

  // Strip [if]/[endif]
  c = c.replace(/\[\/?(?:if|endif)[^\]]*\]/g, "");

  // Old YouTube <object>/<embed> → URL
  c = c.replace(/<object[^>]*>.*?<\/object>/gs, (match) => {
    const id = match.match(/youtube\.com\/v\/([^&"']+)/)?.[1];
    return id ? `\nhttps://www.youtube.com/watch?v=${id}\n` : "";
  });

  // YouTube iframe → URL
  c = c.replace(
    /<iframe[^>]*src="[^"]*youtube\.com\/embed\/([^"?]+)[^"]*"[^>]*>.*?<\/iframe>/gs,
    (_, id) => `\nhttps://www.youtube.com/watch?v=${id}\n`,
  );

  // Strip style and class attributes
  c = c.replace(/\s*style="[^"]*"/g, "");
  c = c.replace(/\s*class="[^"]*"/g, "");
  c = c.replace(/\s*align="[^"]*"/g, "");

  // Strip empty elements
  c = c.replace(/<p>\s*<\/p>/g, "");
  c = c.replace(/<div>\s*<\/div>/g, "");
  c = c.replace(/<span>\s*<\/span>/g, "");

  // Unwrap bare <span> and <div> tags (keep content)
  c = c.replace(/<\/?span>/g, "");
  c = c.replace(/<\/?div>/g, "");

  // Strip <!--more-->
  c = c.replace(/<!--more-->/g, "");

  // Strip &nbsp;
  c = c.replace(/&nbsp;/g, " ");

  return c.trim();
}

function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });

  td.addRule("figure", {
    filter: "figure",
    replacement: (content) => `\n\n${content}\n\n`,
  });

  td.addRule("figcaption", {
    filter: "figcaption",
    replacement: (content) => `*${content}*`,
  });

  td.addRule("strikethrough", {
    filter: ["s", "strike", "del"],
    replacement: (content) => `~~${content}~~`,
  });

  return td;
}

function cleanHtml(html: string): string {
  if (!html.trim()) return "";
  const cleaned = cleanWpContent(html);
  const td = createTurndown();
  let md = td.turndown(cleaned);
  md = md.replace(/\n{3,}/g, "\n\n");
  let result = marked.parse(md.trim()) as string;
  // Turn bare YouTube URLs (from the WP cleanup) back into iframes
  result = result.replace(
    /<a href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">[^<]*<\/a>/g,
    (_, id) =>
      `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
  );
  return result;
}

// ---------------------------------------------------------------------------
// Date Helper
// ---------------------------------------------------------------------------

function parseWpDate(dateGmt: string, dateLocal: string): string | null {
  const d = dateGmt && dateGmt !== "0000-00-00 00:00:00" ? dateGmt : dateLocal;
  if (!d || d === "0000-00-00 00:00:00") return null;
  return d;
}

// ---------------------------------------------------------------------------
// Slug Helper
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Main Migration
// ---------------------------------------------------------------------------

// gi_posts column indices
const P = {
  ID: 0,
  POST_DATE: 2,
  POST_DATE_GMT: 3,
  POST_CONTENT: 4,
  POST_TITLE: 5,
  POST_EXCERPT: 6,
  POST_STATUS: 7,
  POST_NAME: 11,
  POST_MODIFIED: 14,
  POST_MODIFIED_GMT: 15,
  POST_PARENT: 17,
  GUID: 18,
  POST_TYPE: 20,
  POST_MIME_TYPE: 21,
} as const;

// gi_comments column indices
const C = {
  ID: 0,
  POST_ID: 1,
  AUTHOR: 2,
  EMAIL: 3,
  DATE: 6,
  DATE_GMT: 7,
  CONTENT: 8,
  APPROVED: 10,
  TYPE: 12,
  PARENT: 13,
} as const;

async function migrate() {
  console.log("Reading backup.sql...");
  const sql = readFileSync("backup.sql", "utf-8");

  const client = new pg.Client(DB_URL);
  await client.connect();

  console.log("Creating schema...");
  await client.query(SCHEMA);

  // ---- Parse all source data ----
  console.log("Parsing SQL dump...");
  const postRows = extractInserts(sql, "gi_posts");
  const metaRows = extractInserts(sql, "gi_postmeta");
  const giCommentRows = extractInserts(sql, "gi_comments");
  const wpCommentRows = extractInserts(sql, "wp_comments");
  const termRows = extractInserts(sql, "gi_terms");
  const taxonomyRows = extractInserts(sql, "gi_term_taxonomy");
  const relationshipRows = extractInserts(sql, "gi_term_relationships");

  // ---- Build attachment URL lookup (for featured images) ----
  const attachmentUrls = new Map<number, string>();
  for (const row of postRows) {
    if (row[P.POST_TYPE] === "attachment") {
      attachmentUrls.set(row[P.ID] as number, row[P.GUID] as string);
    }
  }

  // ---- Build thumbnail map from postmeta ----
  const thumbnailMap = new Map<number, string>();
  for (const row of metaRows) {
    if (row[2] === "_thumbnail_id") {
      const url = attachmentUrls.get(Number(row[3]));
      if (url) thumbnailMap.set(row[1] as number, url);
    }
  }

  // ---- Insert posts ----
  const relevantPosts = postRows.filter((row) => {
    const type = row[P.POST_TYPE] as string;
    const status = row[P.POST_STATUS] as string;
    return RELEVANT_POST_TYPES.has(type) && status in STATUS_MAP;
  });

  console.log(`Migrating ${relevantPosts.length} posts...`);
  const wpIdToUuid = new Map<number, string>();
  const slugsSeen = new Set<string>();

  for (const row of relevantPosts) {
    const wpId = row[P.ID] as number;
    const postType = POST_TYPE_MAP[row[P.POST_TYPE] as string];
    const status = STATUS_MAP[row[P.POST_STATUS] as string];

    let slug = (row[P.POST_NAME] as string) || slugify(row[P.POST_TITLE] as string);
    if (slugsSeen.has(slug)) slug = `${slug}-${wpId}`;
    slugsSeen.add(slug);

    const content = cleanHtml(row[P.POST_CONTENT] as string);
    const excerpt = (row[P.POST_EXCERPT] as string) || null;
    const featuredImage = thumbnailMap.get(wpId) ?? null;
    const createdAt = parseWpDate(row[P.POST_DATE_GMT] as string, row[P.POST_DATE] as string);
    const updatedAt = parseWpDate(
      row[P.POST_MODIFIED_GMT] as string,
      row[P.POST_MODIFIED] as string,
    );
    const publishedAt = status === "published" ? createdAt : null;

    const result = await client.query(
      `INSERT INTO posts (title, slug, content, excerpt, featured_image, post_type, status, published_at, created_at, updated_at, wp_original_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()), COALESCE($10, now()), $11)
       RETURNING id`,
      [
        row[P.POST_TITLE],
        slug,
        content,
        excerpt,
        featuredImage,
        postType,
        status,
        publishedAt,
        createdAt,
        updatedAt,
        wpId,
      ],
    );
    wpIdToUuid.set(wpId, result.rows[0].id);
  }

  // ---- Comments ----
  console.log("Migrating comments...");

  const isRealComment = (row: (string | number)[]) =>
    row[C.APPROVED] === "1" && row[C.TYPE] !== "pingback" && row[C.TYPE] !== "trackback";

  const approvedGi = giCommentRows.filter(isRealComment);
  const approvedWp = wpCommentRows.filter(isRealComment);

  // Dedup: find wp_comments not already in gi_comments
  const giSigs = new Set(approvedGi.map((r) => `${r[C.POST_ID]}-${r[C.EMAIL]}-${r[C.DATE_GMT]}`));

  const extraWp = approvedWp.filter((r) => {
    const postId = r[C.POST_ID] as number;
    return wpIdToUuid.has(postId) && !giSigs.has(`${postId}-${r[C.EMAIL]}-${r[C.DATE_GMT]}`);
  });

  console.log(`  ${approvedGi.length} from gi_comments, ${extraWp.length} extra from wp_comments`);

  interface CommentEntry {
    sourceKey: string;
    wpPostId: number;
    authorName: string;
    authorEmail: string | null;
    content: string;
    createdAt: string | null;
    wpParentKey: string | null;
  }

  const allComments: CommentEntry[] = [
    ...approvedGi.map((r) => ({
      sourceKey: `gi-${r[C.ID]}`,
      wpPostId: r[C.POST_ID] as number,
      authorName: r[C.AUTHOR] as string,
      authorEmail: (r[C.EMAIL] as string) || null,
      content: r[C.CONTENT] as string,
      createdAt: parseWpDate(r[C.DATE_GMT] as string, r[C.DATE] as string),
      wpParentKey: (r[C.PARENT] as number) > 0 ? `gi-${r[C.PARENT]}` : null,
    })),
    ...extraWp.map((r) => ({
      sourceKey: `wp-${r[C.ID]}`,
      wpPostId: r[C.POST_ID] as number,
      authorName: r[C.AUTHOR] as string,
      authorEmail: (r[C.EMAIL] as string) || null,
      content: r[C.CONTENT] as string,
      createdAt: parseWpDate(r[C.DATE_GMT] as string, r[C.DATE] as string),
      wpParentKey: (r[C.PARENT] as number) > 0 ? `wp-${r[C.PARENT]}` : null,
    })),
  ];

  // First pass: insert without parent_id
  const commentKeyToUuid = new Map<string, string>();
  let insertedComments = 0;

  for (const comment of allComments) {
    const postUuid = wpIdToUuid.get(comment.wpPostId);
    if (!postUuid) continue;

    const result = await client.query(
      `INSERT INTO comments (post_id, author_name, author_email, content, created_at)
       VALUES ($1, $2, $3, $4, COALESCE($5, now()))
       RETURNING id`,
      [postUuid, comment.authorName, comment.authorEmail, comment.content, comment.createdAt],
    );
    commentKeyToUuid.set(comment.sourceKey, result.rows[0].id);
    insertedComments++;
  }

  // Second pass: wire up threaded parent_id
  let threadedCount = 0;
  for (const comment of allComments) {
    if (!comment.wpParentKey) continue;
    const childUuid = commentKeyToUuid.get(comment.sourceKey);
    const parentUuid = commentKeyToUuid.get(comment.wpParentKey);
    if (childUuid && parentUuid) {
      await client.query(`UPDATE comments SET parent_id = $1 WHERE id = $2`, [
        parentUuid,
        childUuid,
      ]);
      threadedCount++;
    }
  }

  console.log(`  Inserted ${insertedComments} comments (${threadedCount} threaded)`);

  // ---- Taxonomies ----
  console.log("Migrating taxonomies...");

  const termMap = new Map<number, { name: string; slug: string }>();
  for (const row of termRows) {
    termMap.set(row[0] as number, { name: row[1] as string, slug: row[2] as string });
  }

  // term_taxonomy_id → { termId, taxonomy }
  const ttMap = new Map<number, { termId: number; taxonomy: string }>();
  for (const row of taxonomyRows) {
    ttMap.set(row[0] as number, { termId: row[1] as number, taxonomy: row[2] as string });
  }

  // Classify terms by taxonomy
  const termsByTaxonomy = {
    post_tag: new Set<number>(),
    sessao: new Set<number>(),
    cursos: new Set<number>(),
  };
  for (const [, tt] of ttMap) {
    if (tt.taxonomy in termsByTaxonomy) {
      termsByTaxonomy[tt.taxonomy as keyof typeof termsByTaxonomy].add(tt.termId);
    }
  }

  // Insert each taxonomy type
  async function insertTaxonomy(table: string, termIds: Set<number>) {
    const idMap = new Map<number, string>();
    for (const termId of termIds) {
      const term = termMap.get(termId);
      if (!term) continue;
      const result = await client.query(
        `INSERT INTO ${table} (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [term.name, term.slug],
      );
      idMap.set(termId, result.rows[0].id);
    }
    return idMap;
  }

  const tagIdMap = await insertTaxonomy("tags", termsByTaxonomy.post_tag);
  const sectionIdMap = await insertTaxonomy("sections", termsByTaxonomy.sessao);
  const courseIdMap = await insertTaxonomy("courses", termsByTaxonomy.cursos);

  // Insert relationships
  // term_taxonomy_id → termId
  const ttIdToTermId = new Map<number, number>();
  for (const [ttId, tt] of ttMap) ttIdToTermId.set(ttId, tt.termId);

  const relCounts = { tags: 0, sections: 0, courses: 0 };

  for (const row of relationshipRows) {
    const objectId = row[0] as number;
    const ttId = row[1] as number;
    const postUuid = wpIdToUuid.get(objectId);
    if (!postUuid) continue;

    const termId = ttIdToTermId.get(ttId);
    if (termId === undefined) continue;

    const tagUuid = tagIdMap.get(termId);
    if (tagUuid) {
      await client.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postUuid, tagUuid],
      );
      relCounts.tags++;
      continue;
    }

    const sectionUuid = sectionIdMap.get(termId);
    if (sectionUuid) {
      await client.query(
        `INSERT INTO post_sections (post_id, section_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postUuid, sectionUuid],
      );
      relCounts.sections++;
      continue;
    }

    const courseUuid = courseIdMap.get(termId);
    if (courseUuid) {
      await client.query(
        `INSERT INTO post_courses (post_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postUuid, courseUuid],
      );
      relCounts.courses++;
      continue;
    }
  }

  console.log(`  Tags: ${tagIdMap.size} (${relCounts.tags} relationships)`);
  console.log(`  Sections: ${sectionIdMap.size} (${relCounts.sections} relationships)`);
  console.log(`  Courses: ${courseIdMap.size} (${relCounts.courses} relationships)`);

  // ---- Summary ----
  const counts = await client.query(`
    SELECT
      (SELECT count(*) FROM posts) as posts,
      (SELECT count(*) FROM comments) as comments,
      (SELECT count(*) FROM tags) as tags,
      (SELECT count(*) FROM sections) as sections,
      (SELECT count(*) FROM courses) as courses
  `);
  const s = counts.rows[0];

  console.log("\n=== Migration Summary ===");
  console.log(
    `Posts: ${s.posts} | Comments: ${s.comments} | Tags: ${s.tags} | Sections: ${s.sections} | Courses: ${s.courses}`,
  );

  const byType = await client.query(
    `SELECT post_type, status, count(*)::int FROM posts GROUP BY post_type, status ORDER BY post_type, status`,
  );
  console.log("\nBy type/status:");
  for (const row of byType.rows) {
    console.log(`  ${row.post_type} (${row.status}): ${row.count}`);
  }

  await client.end();
  console.log("\nDone!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
