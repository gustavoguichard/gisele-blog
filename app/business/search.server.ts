import { applySchema } from "composable-functions";
import { sql } from "kysely";
import { getDb } from "~/db/db.server";
import { stripHtml, truncate } from "~/lib/format";
import { snippetAround } from "~/lib/highlight";
import { SEARCH_LIMIT, SEARCH_MIN_LENGTH, SEARCH_THRESHOLD, searchSchema } from "./search.common";

type SearchResultType = "post" | "work";

interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  slug: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  snippet: string;
}

function buildSnippet(content: string, excerpt: string | null, query: string): string {
  const text = stripHtml(content).replace(/\s+/g, " ");
  return snippetAround(text, query) ?? truncate(stripHtml(excerpt ?? ""), 160);
}

const searchContent = applySchema(searchSchema)(async ({ q }) => {
  if (q.length < SEARCH_MIN_LENGTH) return { query: q, results: [] as SearchResult[] };

  const term = sql`immutable_unaccent(${q})`;
  const titleRank = sql<number>`strict_word_similarity(${term}, immutable_unaccent(title))`;
  const rank = sql<number>`strict_word_similarity(${term}, search_text)`;
  const matches = sql<boolean>`${rank} >= ${SEARCH_THRESHOLD}`;
  const db = getDb();

  const rows = await db
    .selectFrom("posts")
    .where("status", "=", "published")
    .where(matches)
    .select(["id", "title", "slug", "excerpt", "content", "featuredImage", "publishedAt"])
    .select([sql<SearchResultType>`'post'`.as("type"), titleRank.as("titleRank"), rank.as("rank")])
    .unionAll(
      db
        .selectFrom("works")
        .where("status", "=", "published")
        .where(matches)
        .select(["id", "title", "slug", "excerpt", "content", "featuredImage"])
        .select([
          sql<Date | null>`null`.as("publishedAt"),
          sql<SearchResultType>`'work'`.as("type"),
          titleRank.as("titleRank"),
          rank.as("rank"),
        ]),
    )
    .orderBy("titleRank", "desc")
    .orderBy("rank", "desc")
    .orderBy("publishedAt", "desc")
    .limit(SEARCH_LIMIT)
    .execute();

  const results: SearchResult[] = rows.map((row) => ({
    type: row.type,
    id: row.id,
    title: row.title,
    slug: row.slug,
    featuredImage: row.featuredImage,
    publishedAt: row.publishedAt,
    snippet: buildSnippet(row.content, row.excerpt, q),
  }));

  return { query: q, results };
});

export type { SearchResult, SearchResultType };
export { searchContent };
