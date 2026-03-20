import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/courses";
import { fetchCourses } from "~/db/queries.server";
import { PostContent } from "~/components/post-content";
import { PageHeader, GoldDivider } from "~/components/decorative";
import { formatDate } from "~/lib/format";

export function meta() {
  return [
    { title: "Cursos — Gisele de Menezes" },
    {
      name: "description",
      content: "Cursos e formações oferecidos por Gisele de Menezes.",
    },
  ];
}

export async function loader() {
  const courses = await fromSuccess(fetchCourses)();
  return { courses };
}

export function headers() {
  return { "Cache-Control": "private, max-age=0" };
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader title="Cursos" />

      <div className="space-y-16">
        {courses.map((course) => (
          <article key={course.id}>
            <header className="text-center mb-8">
              <p className="section-label mb-3">
                ✦ {formatDate(course.publishedAt)} ✦
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                {course.title}
              </h2>
              <GoldDivider />
            </header>

            {course.featuredImage && (
              <figure className="mb-8">
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
          </article>
        ))}
      </div>

      {courses.length === 0 && (
        <p className="text-text-muted text-center py-12">
          Nenhum curso disponível no momento.
        </p>
      )}
    </div>
  );
}
