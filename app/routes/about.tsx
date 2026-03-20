import type { Route } from "./+types/about";
import { fetchPageBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { PageHeader } from "~/components/decorative";

export function meta() {
  return [
    { title: "Sobre — Gisele de Menezes" },
    {
      name: "description",
      content:
        "Conheça Gisele de Menezes — terapeuta holística, praticante de Ayurveda, massoterapeuta e escritora.",
    },
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
  return { "Cache-Control": "private, max-age=0" };
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
