import { fromSuccess } from "composable-functions";
import { Link } from "react-router";
import type { Route } from "./+types/courses";
import { fetchCourses } from "~/db/queries.server";
import { PageHeader } from "~/components/decorative";
import {
  formatDate,
  stripHtml,
  truncate,
  hideOnImgError,
  type ContentCardData,
} from "~/lib/format";

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
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export { CourseCard };

function CourseCard({ course }: { course: ContentCardData }) {
  return (
    <article className="group bg-bg-card rounded-xl border border-border overflow-hidden">
      <Link to={`/cursos/${course.slug}`} className="block sm:flex">
        <div className="sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-bg-warm">
          {course.featuredImage ? (
            <img
              src={course.featuredImage}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={hideOnImgError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bg-warm to-border flex items-center justify-center">
              <span className="text-3xl text-accent/40">✦</span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col justify-center">
          <time className="text-xs font-sans text-text-muted tracking-wider uppercase mb-2">
            {formatDate(course.publishedAt)}
          </time>
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-snug mb-2">
            {course.title}
          </h3>
          {course.excerpt && (
            <p className="text-sm text-text-muted leading-relaxed">
              {truncate(stripHtml(course.excerpt), 180)}
            </p>
          )}
          <span className="inline-block mt-3 text-sm font-sans font-semibold text-primary border-b border-accent/30 group-hover:border-primary transition-colors self-start">
            Ver curso →
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader title="Cursos" />

      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-center py-12">Nenhum curso disponível no momento.</p>
      )}
    </div>
  );
}
