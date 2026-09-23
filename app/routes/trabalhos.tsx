import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/trabalhos";
import { fetchWorks } from "~/business/works.server";
import { WorkCard } from "~/business/works.ui";
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
