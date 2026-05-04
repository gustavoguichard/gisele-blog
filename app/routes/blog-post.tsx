import { data, href, redirect, isRouteErrorResponse, useRouteError } from "react-router";
import { collect, fromSuccess, isInputError } from "composable-functions";
import type { Route } from "./+types/blog-post";
import { fetchPostBySlug } from "~/business/posts.server";
import { fetchTagsForPost } from "~/business/tags.server";
import { fetchCommentsForPost, insertComment } from "~/business/comments.server";
import { getClientIp, getTurnstileSiteKey } from "~/business/spam.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { CommentThread } from "~/components/comment-thread";
import { PageHeader } from "~/components/decorative";
import { ErrorPage } from "~/components/error-page";
import { TagList } from "~/components/tag";
import { formatDate, hideParentOnImgError } from "~/lib/format";
import { postSeoMeta, blogPostingJsonLd, breadcrumbJsonLd } from "~/lib/seo";

export async function loader({ params }: Route.LoaderArgs) {
  if (params.slug === "feed") {
    throw redirect("/feed.xml", 301);
  }

  const result = await fetchPostBySlug({ slug: params.slug });
  if (!result.success) {
    throw new Response("Post não encontrado", { status: 404 });
  }
  const post = result.data;

  const { tags, comments } = await fromSuccess(
    collect({ tags: fetchTagsForPost, comments: fetchCommentsForPost }),
  )(post.id);

  return { post, tags, comments, turnstileSiteKey: getTurnstileSiteKey() };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  if (formData.get("website")) {
    return data({ ok: true as const });
  }

  const timestamp = formData.get("_t");
  if (typeof timestamp === "string") {
    const elapsed = Date.now() - Number(timestamp);
    if (elapsed < 3000) {
      return data({ ok: true as const });
    }
  }

  const postResult = await fetchPostBySlug({ slug: params.slug });
  if (!postResult.success) {
    throw new Response("Post não encontrado", { status: 404 });
  }

  const result = await insertComment(
    {
      postId: postResult.data.id,
      parentId: (formData.get("parentId") as string) ?? null,
      authorName: (formData.get("authorName") as string) ?? "",
      authorEmail: (formData.get("authorEmail") as string) ?? "",
      content: (formData.get("content") as string) ?? "",
      "cf-turnstile-response": (formData.get("cf-turnstile-response") as string) ?? "",
    },
    { ip: getClientIp(request) },
  );

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of result.errors) {
      if (isInputError(err)) {
        const field = (err as unknown as { path: string[] }).path[0];
        if (field) fieldErrors[field] = err.message;
      }
    }
    return data({ ok: false as const, fieldErrors }, { status: 422 });
  }

  return data({ ok: true as const });
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { post } = loaderData;
  return [
    ...postSeoMeta(post, "/blog"),
    blogPostingJsonLd(post),
    breadcrumbJsonLd([
      { name: "Início", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, tags, comments, turnstileSiteKey } = loaderData;

  return (
    <Container as="article" className="py-12">
      <PageHeader label={formatDate(post.publishedAt)} title={post.title} />

      {post.featuredImage && (
        <figure className="mb-10">
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

      <CommentThread comments={comments} turnstileSiteKey={turnstileSiteKey} />
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
