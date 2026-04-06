import { fromSuccess } from "composable-functions";
import { fetchPostsForFeed } from "~/business/posts.server";
import { stripHtml, truncate } from "~/lib/format";
import { SITE } from "~/lib/seo";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function imageMimeType(url: string): string {
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "";
  return IMAGE_MIME_TYPES[ext] ?? "image/jpeg";
}

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path}`;
}

export async function loader() {
  const posts = await fromSuccess(fetchPostsForFeed)(30);

  const items = posts
    .map((post) => {
      const link = `${SITE.url}/blog/${post.slug}`;
      const description = post.excerpt
        ? truncate(stripHtml(post.excerpt), 300)
        : truncate(stripHtml(post.content), 300);
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : "";

      let enclosure = "";
      if (post.featuredImage) {
        const imageUrl = toAbsoluteUrl(post.featuredImage);
        enclosure = `\n      <enclosure url="${escapeXml(imageUrl)}" type="${imageMimeType(imageUrl)}" length="0" />`;
      }

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}${enclosure}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts[0]?.publishedAt
    ? new Date(posts[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
