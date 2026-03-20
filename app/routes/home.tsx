import { Link } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/home";
import { fetchRecentPosts } from "~/db/queries.server";
import { PostCard } from "~/components/post-card";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";

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
  return { "Cache-Control": "public, max-age=300, s-maxage=3600" };
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
            <Link
              to="/blog"
              className="px-6 py-2.5 bg-primary text-white dark:text-bg rounded text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Ler o blog
            </Link>
            <Link
              to="/sobre"
              className="px-6 py-2.5 border border-border-dark text-primary rounded text-sm font-semibold hover:border-primary transition-colors"
            >
              Sobre mim
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="section-label mb-3">✦ Publicações recentes ✦</p>
          <h2 className="text-2xl font-bold text-primary">Do blog</h2>
          <GoldDivider />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-block px-6 py-2.5 border border-border-dark text-primary rounded text-sm font-sans font-semibold hover:border-primary transition-colors"
          >
            Ver todas as publicações
          </Link>
        </div>
      </section>
    </div>
  );
}
