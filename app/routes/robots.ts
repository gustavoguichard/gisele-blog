import { SITE } from "~/lib/seo";

export function loader() {
  const text = `User-agent: *
Allow: /
Disallow: /set-theme
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

# LLM access policy: see /llms.txt
Sitemap: ${SITE.url}/sitemap.xml
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
