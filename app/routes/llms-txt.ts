import { fromSuccess } from "composable-functions";
import { fetchPostsForFeed, fetchWorks } from "~/db/queries.server";
import { stripHtml, truncate } from "~/lib/format";
import { SITE } from "~/lib/seo";

export async function loader() {
  const [posts, works] = await Promise.all([
    fromSuccess(fetchPostsForFeed)(20),
    fromSuccess(fetchWorks)(),
  ]);

  const sections: string[] = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    "",
    `## Publicações Recentes`,
    ...posts.map((post) => {
      const description = post.excerpt
        ? truncate(stripHtml(post.excerpt), 200)
        : truncate(stripHtml(post.content), 200);
      return `### ${post.title}\n${SITE.url}/blog/${post.slug}\n${description}`;
    }),
    "",
    `## Trabalhos`,
    ...works.map((work) => {
      const description = work.excerpt
        ? truncate(stripHtml(work.excerpt), 200)
        : truncate(stripHtml(work.content), 200);
      return `### ${work.title}\n${SITE.url}/trabalhos/${work.slug}\n${description}`;
    }),
    "",
    `## Sobre`,
    `Gisele de Menezes — terapeuta, praticante de Ayurveda, massoterapeuta e escritora.`,
    `- Sobre: ${SITE.url}/sobre`,
    `- Contato: ${SITE.url}/contato`,
    `- Depoimentos: ${SITE.url}/depoimentos`,
    "",
    `## Feeds`,
    `- RSS: ${SITE.url}/feed.xml`,
    `- JSON Feed: ${SITE.url}/feed.json`,
  ];

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
