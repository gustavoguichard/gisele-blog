import { ButtonLink } from "~/components/button";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/home";
import { fetchRecentPosts } from "~/db/queries.server";
import { PostGrid } from "~/components/post-grid";
import { GoldDivider, OrnamentalCircles, PageHeader } from "~/components/decorative";

export function meta() {
  return [
    { title: "Gisele de Menezes — Terapeuta, Escritora e Praticante de Ayurveda" },
    {
      name: "description",
      content:
        "Blog de Gisele de Menezes — terapeuta holística, praticante de Ayurveda, massoterapeuta e escritora. Reflexões sobre saúde, espiritualidade e bem-estar.",
    },
  ];
}

export async function loader() {
  const posts = await fromSuccess(fetchRecentPosts)(6);
  return { posts };
}

export function headers() {
  return { "Cache-Control": "private, max-age=0" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div>
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-bg-warm to-bg overflow-hidden">
        <OrnamentalCircles />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="section-label mb-7">✦ Terapeuta · Escritora · Ayurveda ✦</p>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
            <span className="text-primary">Bem-vinda</span>
            <br />
            <span className="italic font-normal text-text-subtle">ao meu espaço</span>
          </h1>

          <GoldDivider />

          <p className="text-text-muted max-w-md mx-auto leading-relaxed italic">
            Um lugar sagrado para reflexões sobre saúde, espiritualidade e autoconhecimento.
          </p>

          <div className="mt-10 flex gap-3 justify-center font-sans">
            <ButtonLink to="/blog">Ler o blog</ButtonLink>
            <ButtonLink to="/sobre" variant="secondary">
              Sobre mim
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <PageHeader as="h2" label="Publicações recentes" title="Do blog" />

        <PostGrid posts={posts} />

        <div className="text-center mt-10">
          <ButtonLink to="/blog" variant="secondary" className="font-sans">
            Ver todas as publicações
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
