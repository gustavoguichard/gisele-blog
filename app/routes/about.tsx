import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/about";
import { fetchPageBySlug } from "~/db/queries.server";
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
  const page = await fromSuccess(fetchPageBySlug)({
    slug: "quem-e-gisele-de-menezes",
  });
  return { page };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader title={page.title} />
      <PostContent html={page.content} />
    </div>
  );
}
