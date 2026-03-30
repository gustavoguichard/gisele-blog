import { fromSuccess } from "composable-functions";
import { Link, href } from "react-router";
import type { Route } from "./+types/courses";
import { fetchCourses } from "~/db/queries.server";
import { PageHeader } from "~/components/decorative";
import { stripHtml, truncate, hideOnImgError, type ContentCardData } from "~/lib/format";
import { generateMeta, collectionPageJsonLd } from "~/lib/seo";

export function meta({ loaderData }: Route.MetaArgs) {
  const meta = generateMeta({
    title: "Trabalhos",
    description: "Trabalhos, cursos e formações oferecidos por Gisele de Menezes.",
    url: "/trabalhos",
  });

  if (loaderData?.courses) {
    return [
      ...meta,
      collectionPageJsonLd("Trabalhos", "/trabalhos", loaderData.courses, "/trabalhos"),
    ];
  }

  return meta;
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
    <article className="group relative overflow-hidden rounded-xl">
      <Link to={href("/trabalhos/:slug", { slug: course.slug })} className="block sm:flex">
        <div className="sm:w-80 shrink-0 aspect-[4/5] sm:aspect-auto overflow-hidden bg-bg-warm relative">
          {course.featuredImage ? (
            <img
              src={course.featuredImage}
              alt={course.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={hideOnImgError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bg-warm to-border flex items-center justify-center">
              <span className="text-4xl text-accent/40">✦</span>
            </div>
          )}
          <div className="absolute inset-0 border border-accent/20 rounded-xl pointer-events-none" />
        </div>
        <div className="p-8 sm:py-10 flex flex-col justify-center bg-bg-warm border border-border sm:border-l-0 rounded-xl sm:rounded-l-none grow">
          <div className="w-8 h-px bg-accent mb-4" />
          <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-snug mb-3">
            {course.title}
          </h2>
          {course.excerpt && (
            <p className="text-text-muted leading-relaxed">
              {truncate(stripHtml(course.excerpt), 200)}
            </p>
          )}
          <div className="mt-6 flex items-center gap-2 text-sm font-sans font-semibold text-primary group-hover:text-accent transition-colors">
            <span>Explorar</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader title="Trabalhos" />

      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-center py-12">Nenhum trabalho disponível no momento.</p>
      )}
    </div>
  );
}
