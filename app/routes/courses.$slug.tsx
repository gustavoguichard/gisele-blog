import { isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/courses.$slug";
import { fetchCourseBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { PageHeader } from "~/components/decorative";
import { ErrorPage } from "~/components/error-page";
import { formatDate, stripHtml, truncate } from "~/lib/format";

export async function loader({ params }: Route.LoaderArgs) {
  const result = await fetchCourseBySlug({ slug: params.slug });
  if (!result.success) {
    throw new Response("Curso não encontrado", { status: 404 });
  }
  return { course: result.data };
}

export function headers() {
  return { "Cache-Control": "private, max-age=0" };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { course } = loaderData;
  const description = course.excerpt
    ? truncate(stripHtml(course.excerpt), 160)
    : truncate(stripHtml(course.content), 160);

  return [
    { title: `${course.title} — Cursos — Gisele de Menezes` },
    { name: "description", content: description },
    { property: "og:title", content: course.title },
    { property: "og:description", content: description },
    ...(course.featuredImage ? [{ property: "og:image", content: course.featuredImage }] : []),
  ];
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <Container as="article" className="py-12">
      <PageHeader label={formatDate(course.publishedAt)} title={course.title} />

      {course.featuredImage && (
        <figure className="mb-10 -mx-4 sm:mx-0">
          <img
            src={course.featuredImage}
            alt={course.title}
            className="w-full rounded-xl border border-border"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
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
      linkHref="/cursos"
      linkText="Voltar aos cursos"
    />
  );
}
