import type { Route } from "./+types/about";
import { fetchPageBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { PageHeader } from "~/components/decorative";
import { generateMeta, aboutPageJsonLd } from "~/lib/seo";

export function meta() {
  return [
    ...generateMeta({
      title: "Sobre",
      description:
        "Conheça Gisele de Menezes — terapeuta holística, praticante de Ayurveda, massoterapeuta e escritora.",
      url: "/sobre",
    }),
    aboutPageJsonLd(),
  ];
}

export async function loader() {
  const result = await fetchPageBySlug({ slug: "quem-e-gisele-de-menezes" });
  if (!result.success) {
    throw new Response("Página não encontrada", { status: 404 });
  }
  return { page: result.data };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <Container className="py-12">
      <PageHeader title={page.title} />
      <PostContent html={page.content} />
    </Container>
  );
}
