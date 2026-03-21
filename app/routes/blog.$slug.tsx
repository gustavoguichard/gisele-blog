import { href, isRouteErrorResponse, useRouteError } from "react-router";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/blog.$slug";
import { fetchPostBySlug, fetchTagsForPost, fetchCommentsForPost } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { CommentThread } from "~/components/comment-thread";
import { PageHeader } from "~/components/decorative";
import { ErrorPage } from "~/components/error-page";
import { TagList } from "~/components/tag";
import { formatDate, hideParentOnImgError } from "~/lib/format";
import { postSeoMeta, blogPostingJsonLd } from "~/lib/seo";

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
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { post } = loaderData;
  return [...postSeoMeta(post, "/blog"), blogPostingJsonLd(post)];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, tags, comments } = loaderData;

  return (
    <Container as="article" className="py-12">
      <PageHeader label={formatDate(post.publishedAt)} title={post.title} />

      {post.featuredImage && (
        <figure className="mb-10 -mx-4 sm:mx-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            width={1200}
            height={630}
            fetchPriority="high"
            decoding="async"
            className="w-full h-auto rounded-xl border border-border"
            onError={hideParentOnImgError}
          />
        </figure>
      )}

      <PostContent html={post.content} />

      <TagList tags={tags} />

      <CommentThread comments={comments} />
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <ErrorPage
      title={is404 ? "Publicação não encontrada" : "Erro ao carregar publicação"}
      message={
        is404
          ? "A publicação que você procura não existe ou foi removida."
          : "Ocorreu um erro inesperado. Tente novamente."
      }
      linkHref={href("/blog")}
      linkText="Voltar ao blog"
    />
  );
}
