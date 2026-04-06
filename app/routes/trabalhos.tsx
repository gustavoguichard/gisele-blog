import { fromSuccess } from "composable-functions";
import { Link, href } from "react-router";
import type { Route } from "./+types/trabalhos";
import { fetchWorks } from "~/business/works.server";
import { stripHtml, truncate, hideOnImgError, type ContentCardData } from "~/lib/format";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";
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
  const courses = await fromSuccess(fetchWorks)();
  return { courses };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export { WorkCard };

function WorkCard({ course }: { course: ContentCardData }) {
  return (
    <article className="group relative overflow-hidden rounded-xl">
      <Link to={href("/trabalhos/:slug", { slug: course.slug })} className="block sm:flex">
        <div className="sm:w-80 shrink-0 aspect-[4/5] sm:aspect-auto sm:min-h-52 overflow-hidden bg-bg-warm relative rounded-t-xl sm:rounded-t-none sm:rounded-l-xl">
          {course.featuredImage ? (
            <img
              src={course.featuredImage}
              alt={course.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={hideOnImgError}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-bg-warm to-border flex items-center justify-center">
              <span className="text-4xl text-accent/40">✦</span>
            </div>
          )}
          <div className="absolute inset-0 border border-accent/20 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl pointer-events-none" />
        </div>
        <div className="p-8 sm:py-10 flex flex-col justify-center bg-bg-warm border border-border border-t-0 sm:border-t sm:border-l-0 rounded-b-xl sm:rounded-b-none sm:rounded-r-xl grow">
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

  if (courses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <p className="text-text-muted text-center py-12">Nenhum trabalho disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <section className="relative py-14 overflow-hidden bg-bg-warm border-b border-border mb-12">
        <OrnamentalCircles />
        <div className="relative text-center px-4">
          <p className="section-label mb-3">✦ Caminhos de Cura ✦</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Trabalhos</h1>
          <GoldDivider />
          <p className="text-text-muted max-w-lg mx-auto leading-relaxed italic">
            Vivências, formações e imersões guiadas pela sabedoria ancestral do Ayurveda e da cura
            holística
          </p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {courses.map((course) => (
            <WorkCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
