import { Link, redirect } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/blog.index";
import {
  fetchPostsPaginated,
  fetchPostsCount,
  fetchPostBySlug,
  PER_PAGE,
} from "~/db/queries.server";
import { Pagination } from "~/components/pagination";
import { PostListItem } from "~/components/post-list-item";
import { PageHeader, GoldDivider } from "~/components/decorative";
import { formatDate, extractFirstParagraphs } from "~/lib/format";

export function meta() {
  return [
    { title: "Blog — Gisele de Menezes" },
    {
      name: "description",
      content:
        "Artigos sobre Ayurveda, saúde holística, espiritualidade e bem-estar por Gisele de Menezes.",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const page = params.page ? Number(params.page) : 1;

  if (page === 1 && params.page) {
    throw redirect("/blog");
  }

  const [posts, totalPosts] = await Promise.all([
    fromSuccess(fetchPostsPaginated)({ page }),
    fromSuccess(fetchPostsCount)(),
  ]);

  const totalPages = Math.ceil(totalPosts / PER_PAGE);

  const heroContent =
    page === 1 && posts[0]
      ? await fetchPostBySlug({ slug: posts[0].slug })
      : null;
  const heroBody = heroContent?.success ? heroContent.data.content : null;

  return { posts, currentPage: page, totalPages, heroBody };
}

export function headers() {
  return { "Cache-Control": "private, max-age=0" };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts, currentPage, totalPages, heroBody } = loaderData;

  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader title="Blog" />
        <p className="text-text-muted text-center py-12">Nenhuma publicação encontrada.</p>
      </div>
    );
  }

  const isFirstPage = currentPage === 1;
  const [hero, ...rest] = posts;

  if (!isFirstPage) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader title="Blog" />
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    );
  }

  const excerptHtml = heroBody ? extractFirstParagraphs(heroBody, 2) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader title="Blog" />

      {/* Hero — centered editorial style */}
      <div className="text-center mb-12">
        <p className="section-label mb-4">✦ Publicação mais recente ✦</p>
        <Link to={`/blog/${hero.slug}`} className="block group">
          {hero.featuredImage && (
            <div className="aspect-[21/9] rounded-xl overflow-hidden bg-bg-warm mb-6 border border-border">
              <img
                src={hero.featuredImage}
                alt={hero.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold group-hover:text-primary transition-colors leading-tight tracking-tight max-w-2xl mx-auto">
            {hero.title}
          </h2>
        </Link>
        <GoldDivider />
        <time className="text-xs font-sans text-text-muted tracking-wider uppercase">
          {formatDate(hero.publishedAt)}
        </time>
        {excerptHtml && (
          <div className="text-left max-w-2xl mx-auto mt-4">
            <div
              className="prose prose-lg max-w-none prose-p:text-text-body prose-p:leading-relaxed prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: excerptHtml }}
            />
            <Link
              to={`/blog/${hero.slug}`}
              className="inline-block mt-4 text-sm font-sans font-semibold text-primary border-b border-accent/30 hover:border-primary transition-colors"
            >
              Ler mais →
            </Link>
          </div>
        )}
      </div>

      {/* Older posts — list */}
      <div className="border-t border-border pt-10">
        <p className="section-label text-center mb-8">✦ Publicações anteriores ✦</p>
        <div className="divide-y divide-border">
          {rest.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
