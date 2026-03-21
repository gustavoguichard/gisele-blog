import { href, isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/courses.$slug";
import { fetchCourseBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { PageHeader } from "~/components/decorative";
import { ErrorPage } from "~/components/error-page";
import { formatDate, hideParentOnImgError } from "~/lib/format";
import { postSeoMeta, courseJsonLd } from "~/lib/seo";

export async function loader({ params }: Route.LoaderArgs) {
  const result = await fetchCourseBySlug({ slug: params.slug });
  if (!result.success) {
    throw new Response("Curso não encontrado", { status: 404 });
  }
  return { course: result.data };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { course } = loaderData;
  return [...postSeoMeta(course, "/cursos"), courseJsonLd(course)];
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <Container as="article" className="py-12">
      <PageHeader label={formatDate(course.publishedAt)} title={course.title} />

      {course.featuredImage && (
        <figure className="mb-10">
          <img
            src={course.featuredImage}
            alt={course.title}
            width={1200}
            height={630}
            fetchPriority="high"
            decoding="async"
            className="w-full h-auto rounded-xl border border-border"
            onError={hideParentOnImgError}
          />
        </figure>
      )}

      <PostContent html={course.content} />
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <ErrorPage
      title={is404 ? "Curso não encontrado" : "Erro ao carregar curso"}
      message={
        is404
          ? "O curso que você procura não existe ou foi removido."
          : "Ocorreu um erro inesperado. Tente novamente."
      }
      linkHref={href("/cursos")}
      linkText="Voltar aos cursos"
    />
  );
}
