import { fromSuccess } from "composable-functions";
import { fetchSitemapEntries } from "~/business/posts.server";
import { fetchTagsWithCounts } from "~/business/tags.server";
import { SITE } from "~/lib/seo";

export async function loader() {
  const [entries, tags] = await Promise.all([
    fromSuccess(fetchSitemapEntries)(),
    fromSuccess(fetchTagsWithCounts)(),
  ]);

  type SitemapEntry = {
    loc: string;
    changefreq: string;
    priority: string;
    lastmod?: string;
  };

  const staticPages: SitemapEntry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/blog", changefreq: "daily", priority: "0.9" },
    { loc: "/trabalhos", changefreq: "weekly", priority: "0.8" },
    { loc: "/sobre", changefreq: "monthly", priority: "0.6" },
    { loc: "/depoimentos", changefreq: "monthly", priority: "0.5" },
  ];

  const dynamicPages: SitemapEntry[] = entries.map((entry) => {
    const basePath = entry.type === "work" ? "/trabalhos" : "/blog";
    return {
      loc: `${basePath}/${entry.slug}`,
      lastmod: entry.updatedAt ? new Date(entry.updatedAt).toISOString().split("T")[0] : undefined,
      changefreq: "monthly",
      priority: "0.7",
    };
  });

  const tagPages: SitemapEntry[] = tags.map((tag) => ({
    loc: `/blog/tag/${tag.slug}`,
    changefreq: "weekly",
    priority: "0.6",
  }));

  const urls = [...staticPages, ...dynamicPages, ...tagPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const lastmodTag = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
    return `  <url>
    <loc>${SITE.url}${u.loc}</loc>${lastmodTag}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
