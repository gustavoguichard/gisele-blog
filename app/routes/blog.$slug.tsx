import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/blog.$slug";
import { fetchPostBySlug, fetchTagsForPost, fetchCommentsForPost } from "~/db/queries.server";
import { PostContent } from "~/components/post-content";
import { CommentThread } from "~/components/comment-thread";
import { GoldDivider } from "~/components/decorative";
import { formatDate, stripHtml, truncate } from "~/lib/format";

export async function loader({ params }: Route.LoaderArgs) {
  const result = await fetchPostBySlug({ slug: params.slug });
  if (!result.success) {
    throw new Response("Post não encontrado", { status: 404 });
  }
  const post = result.data;

  const [tags, comments] = await Promise.all([
    fromSuccess(fetchTagsForPost)(post.id),
    fromSuccess(fetchCommentsForPost)(post.id),
  ]);

  return { post, tags, comments };
}

export function headers() {
  return { "Cache-Control": "public, max-age=300, s-maxage=3600" };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { post } = loaderData;
  const description = post.excerpt
    ? truncate(stripHtml(post.excerpt), 160)
    : truncate(stripHtml(post.content), 160);

  return [
    { title: `${post.title} — Gisele de Menezes` },
    { name: "description", content: description },
    { property: "og:title", content: post.title },
    { property: "og:description", content: description },
    ...(post.featuredImage ? [{ property: "og:image", content: post.featuredImage }] : []),
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, tags, comments } = loaderData;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <header className="text-center mb-12">
        <p className="section-label mb-4">✦ {formatDate(post.publishedAt)} ✦</p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-primary">
          {post.title}
        </h1>
        <GoldDivider />
      </header>

      {post.featuredImage && (
        <figure className="mb-10 -mx-4 sm:mx-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-xl border border-border"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </figure>
      )}

      <PostContent html={post.content} />

      {tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-bg-warm rounded text-xs font-sans text-text-muted"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <CommentThread comments={comments} />
    </article>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">
        {is404 ? "Publicação não encontrada" : "Erro ao carregar publicação"}
      </h1>
      <p className="text-text-muted mb-6">
        {is404
          ? "A publicação que você procura não existe ou foi removida."
          : "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <Link
        to="/blog"
        className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-sans text-sm"
      >
        Voltar ao blog
      </Link>
    </div>
  );
}
