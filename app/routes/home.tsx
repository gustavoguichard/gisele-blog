import { Link } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/home";
import { fetchRecentPosts } from "~/db/queries.server";
import { PostCard } from "~/components/post-card";

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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div>
      <section className="bg-bg-warm py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-primary leading-tight mb-6">
            Bem-vinda ao meu espaço
          </h1>
          <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto">
            Um lugar para compartilhar reflexões sobre saúde, espiritualidade, Ayurveda e os
            caminhos do autoconhecimento.
          </p>
          <div className="mt-8 flex gap-4 justify-center font-sans">
            <Link
              to="/blog"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold"
            >
              Ler o blog
            </Link>
            <Link
              to="/sobre"
              className="px-6 py-3 border border-border rounded-lg hover:bg-bg transition-colors text-sm font-semibold text-text-muted"
            >
              Sobre mim
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-bold">Publicações recentes</h2>
          <Link to="/blog" className="text-sm font-sans text-primary hover:underline">
            Ver todas &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
