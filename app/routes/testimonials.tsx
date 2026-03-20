import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/testimonials";
import { fetchTestimonials } from "~/db/queries.server";
import { formatDate } from "~/lib/format";

export function meta() {
  return [
    { title: "Depoimentos — Gisele de Menezes" },
    {
      name: "description",
      content: "Depoimentos de clientes e alunos de Gisele de Menezes.",
    },
  ];
}

export async function loader() {
  const testimonials = await fromSuccess(fetchTestimonials)();
  return { testimonials };
}

export default function Testimonials({ loaderData }: Route.ComponentProps) {
  const { testimonials } = loaderData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-10">Depoimentos</h1>

      <div className="space-y-8">
        {testimonials.map((t) => (
          <blockquote key={t.id} className="bg-bg-warm rounded-xl p-6 sm:p-8 border border-border">
            <div
              className="prose prose-stone max-w-none text-text-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t.content }}
            />
            <footer className="mt-4 pt-4 border-t border-border/50">
              <p className="font-sans font-semibold text-sm text-text">{t.title}</p>
              {t.publishedAt && (
                <time className="text-xs font-sans text-text-muted">
                  {formatDate(t.publishedAt)}
                </time>
              )}
            </footer>
          </blockquote>
        ))}
      </div>

      {testimonials.length === 0 && (
        <p className="text-text-muted text-center py-12">Nenhum depoimento disponível.</p>
      )}
    </div>
  );
}
