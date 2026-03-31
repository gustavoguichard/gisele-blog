import { href, isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/trabalho";
import { fetchCourseBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { GoldDivider } from "~/components/decorative";
import { ErrorPage } from "~/components/error-page";
import { stripHtml, hideParentOnImgError } from "~/lib/format";
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
  return [...postSeoMeta(course, "/trabalhos"), courseJsonLd(course)];
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  return (
    <article>
      <div className="bg-bg-warm border-b border-border py-14">
        <Container className="text-center">
          <p className="section-label mb-3">✦ Trabalho ✦</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            {course.title}
          </h1>
          {course.excerpt && (
            <>
              <GoldDivider />
              <p className="text-text-muted italic mt-4 max-w-xl mx-auto leading-relaxed">
                {stripHtml(course.excerpt)}
              </p>
            </>
          )}
        </Container>
      </div>
      <Container className="py-12">
        {course.featuredImage && (
          <figure className="mb-10 -mt-2">
            <img
              src={course.featuredImage}
              alt={course.title}
              className="w-full h-auto rounded-xl border border-border"
              onError={hideParentOnImgError}
            />
          </figure>
        )}
        <PostContent html={course.content} />
      </Container>
    </article>
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
      linkHref={href("/trabalhos")}
      linkText="Voltar aos trabalhos"
    />
  );
}
