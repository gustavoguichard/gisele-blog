import { Link, href, redirect } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/blog";
import {
  fetchPostBySlug,
  fetchPostsCount,
  fetchPostsPaginated,
  PER_PAGE,
} from "~/business/posts.server";
import { fetchTagsWithCounts } from "~/business/tags.server";
import { Pagination } from "~/components/pagination";
import { PostListItem } from "~/components/post-list-item";
import { BlogHeader } from "~/components/blog-header";
import { GoldDivider } from "~/components/decorative";
import { formatDate, extractFirstParagraphs, hideOnImgError } from "~/lib/format";
import { SITE, generateMeta, collectionPageJsonLd } from "~/lib/seo";

export function meta({ loaderData, params }: Route.MetaArgs) {
  const page = params.page ? Number(params.page) : 1;
  const url = page === 1 ? "/blog" : `/blog/page/${page}`;

  const meta = generateMeta({
    title: page > 1 ? `Blog — Página ${page}` : "Blog",
    description:
      "Artigos sobre Ayurveda, saúde, espiritualidade e bem-estar por Gisele de Menezes.",
    url,
  });

  const paginationLinks: Record<string, string>[] = [];
  if (page > 1) {
    const prevUrl = page === 2 ? "/blog" : `/blog/page/${page - 1}`;
    paginationLinks.push({ tagName: "link", rel: "prev", href: `${SITE.url}${prevUrl}` });
  }
  if (loaderData?.totalPages && page < loaderData.totalPages) {
    paginationLinks.push({
      tagName: "link",
      rel: "next",
      href: `${SITE.url}/blog/page/${page + 1}`,
    });
  }

  if (loaderData?.posts) {
    return [
      ...meta,
      ...paginationLinks,
      collectionPageJsonLd("Blog", url, loaderData.posts, "/blog"),
    ];
  }

  return [...meta, ...paginationLinks];
}

export async function loader({ params }: Route.LoaderArgs) {
  const page = params.page ? Number(params.page) : 1;

  if (page === 1 && params.page) {
    throw redirect(href("/blog"));
  }

  const [posts, totalPosts, tags] = await Promise.all([
    fromSuccess(fetchPostsPaginated)({ page }),
    fromSuccess(fetchPostsCount)(),
    fromSuccess(fetchTagsWithCounts)(),
  ]);

  const totalPages = Math.ceil(totalPosts / PER_PAGE);

  const heroContent =
    page === 1 && posts[0] ? await fetchPostBySlug({ slug: posts[0].slug }) : null;
  const heroBody = heroContent?.success ? heroContent.data.content : null;

  return { posts, tags, currentPage: page, totalPages, heroBody };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts, tags, currentPage, totalPages, heroBody } = loaderData;

  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <BlogHeader title="Blog" tags={tags} />
        <p className="text-text-muted text-center py-12">Nenhuma publicação encontrada.</p>
      </div>
    );
  }

  const isFirstPage = currentPage === 1;
  const [hero, ...rest] = posts;

  if (!isFirstPage) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <BlogHeader title="Blog" tags={tags} />
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
      <BlogHeader title="Blog" tags={tags} />

      {/* Hero — centered editorial style */}
      <div className="text-center mb-12">
        <p className="section-label mb-4">✦ Publicação mais recente ✦</p>
        <Link to={href("/blog/:slug", { slug: hero.slug })} className="block group">
          {hero.featuredImage && (
            <div className="aspect-[21/9] rounded-xl overflow-hidden bg-bg-warm mb-6 border border-border">
              <img
                src={hero.featuredImage}
                alt={hero.title}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={hideOnImgError}
              />
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold text-primary group-hover:text-primary-dark transition-colors leading-tight tracking-tight max-w-2xl mx-auto">
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
              to={href("/blog/:slug", { slug: hero.slug })}
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
