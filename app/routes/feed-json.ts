import { fromSuccess } from "composable-functions";
import { fetchPostsForFeed } from "~/business/posts.server";
import { stripHtml, truncate } from "~/lib/format";
import { SITE } from "~/lib/seo";

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path}`;
}

export async function loader() {
  const posts = await fromSuccess(fetchPostsForFeed)(30);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE.name,
    home_page_url: SITE.url,
    feed_url: `${SITE.url}/feed.json`,
    description: SITE.description,
    language: SITE.lang,
    authors: [{ name: SITE.author, url: SITE.url }],
    items: posts.map((post) => {
      const summary = post.excerpt
        ? truncate(stripHtml(post.excerpt), 300)
        : truncate(stripHtml(post.content), 300);

      return {
        id: `${SITE.url}/blog/${post.slug}`,
        url: `${SITE.url}/blog/${post.slug}`,
        title: post.title,
        summary,
        content_text: stripHtml(post.content),
        ...(post.featuredImage ? { image: toAbsoluteUrl(post.featuredImage) } : {}),
        date_published: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        authors: [{ name: SITE.author }],
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=604800",
    },
  });
}
