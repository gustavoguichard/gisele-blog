import { Link } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/blog.$slug";
import { fetchPostBySlug, fetchTagsForPost, fetchCommentsForPost } from "~/db/queries.server";
import { PostContent } from "~/components/post-content";
import { CommentThread } from "~/components/comment-thread";
import { formatDate, stripHtml, truncate } from "~/lib/format";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await fromSuccess(fetchPostBySlug)({ slug: params.slug });

  const [tags, comments] = await Promise.all([
    fromSuccess(fetchTagsForPost)(post.id),
    fromSuccess(fetchCommentsForPost)(post.id),
  ]);

  return { post, tags, comments };
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
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        <time className="text-sm font-sans text-text-muted">{formatDate(post.publishedAt)}</time>
      </header>

      {post.featuredImage && (
        <figure className="mb-10 -mx-4 sm:mx-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-lg"
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
                className="px-3 py-1 bg-bg-warm rounded-full text-xs font-sans text-text-muted"
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
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">Publicação não encontrada</h1>
      <p className="text-text-muted mb-6">
        A publicação que você procura não existe ou foi removida.
      </p>
      <Link
        to="/blog"
        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-sans text-sm"
      >
        Voltar ao blog
      </Link>
    </div>
  );
}
