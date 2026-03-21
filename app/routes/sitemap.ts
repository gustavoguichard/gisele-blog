import { fromSuccess } from "composable-functions";
import { fetchSitemapEntries } from "~/db/queries.server";
import { SITE } from "~/lib/seo";

export async function loader() {
  const entries = await fromSuccess(fetchSitemapEntries)();

  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/blog", changefreq: "daily", priority: "0.9" },
    { loc: "/cursos", changefreq: "weekly", priority: "0.8" },
    { loc: "/sobre", changefreq: "monthly", priority: "0.6" },
    { loc: "/depoimentos", changefreq: "monthly", priority: "0.5" },
  ];

  const dynamicPages = entries.map((entry) => {
    const basePath = entry.postType === "course" ? "/cursos" : "/blog";
    return {
      loc: `${basePath}/${entry.slug}`,
      lastmod: entry.updatedAt ? new Date(entry.updatedAt).toISOString().split("T")[0] : undefined,
      changefreq: "monthly" as const,
      priority: "0.7",
    };
  });

  const urls = [...staticPages, ...dynamicPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE.url}${u.loc}</loc>${
      "lastmod" in u && u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""
    }
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
