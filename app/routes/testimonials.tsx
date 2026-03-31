import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/testimonials";
import { fetchTestimonials } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/decorative";
import { formatDate } from "~/lib/format";
import { generateMeta, reviewsPageJsonLd } from "~/lib/seo";

export function meta({ loaderData }: Route.MetaArgs) {
  const meta = generateMeta({
    title: "Depoimentos",
    description: "Depoimentos de clientes e alunos de Gisele de Menezes.",
    url: "/depoimentos",
  });

  if (loaderData?.testimonials) {
    return [...meta, reviewsPageJsonLd(loaderData.testimonials)];
  }

  return meta;
}

export async function loader() {
  const testimonials = await fromSuccess(fetchTestimonials)();
  return { testimonials };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export default function Testimonials({ loaderData }: Route.ComponentProps) {
  const { testimonials } = loaderData;

  if (testimonials.length === 0) {
    return (
      <Container size="lg" className="py-12">
        <PageHeader title="Depoimentos" />
        <p className="text-text-muted text-center py-12">Nenhum depoimento disponível.</p>
      </Container>
    );
  }

  return (
    <div className="py-12">
      <Container size="md">
        <div className="text-center mb-16 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent/10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-accent/5 pointer-events-none" />
          <p className="section-label mb-4">✦ Depoimentos ✦</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-serif relative">
            Palavras que aquecem
          </h1>
          <p className="mt-4 text-text-muted italic max-w-md mx-auto">
            Gratidão por cada alma que cruzou meu caminho e permitiu que eu fizesse parte da sua
            jornada
          </p>
          <div className="gold-divider mt-6" />
        </div>
      </Container>

      <div className="space-y-0">
        {testimonials.map((t, i) => {
          const isHighlight = i % 3 === 0;
          return (
            <div key={t.id}>
              {isHighlight ? (
                <div className="bg-bg-warm py-12 sm:py-16 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
                  <Container size="sm">
                    <blockquote className="text-center">
                      <span className="block text-6xl text-accent/25 font-serif leading-none mb-4 select-none">
                        "
                      </span>
                      <div
                        className="prose prose-stone prose-lg sm:prose-xl max-w-none text-text-body leading-relaxed italic mx-auto break-words"
                        dangerouslySetInnerHTML={{ __html: t.content }}
                      />
                      <footer className="mt-8">
                        <div className="gold-divider" />
                        <p className="mt-4 font-sans font-bold text-base text-primary tracking-wide">
                          {t.author}
                        </p>
                        {t.publishedAt && (
                          <time className="text-xs font-sans text-text-muted mt-1 block">
                            {formatDate(t.publishedAt)}
                          </time>
                        )}
                      </footer>
                    </blockquote>
                  </Container>
                </div>
              ) : (
                <Container size="md" className="py-10 sm:py-12">
                  <blockquote
                    className={`flex flex-col sm:flex-row gap-6 ${i % 2 === 0 ? "" : "sm:flex-row-reverse"}`}
                  >
                    <div className="shrink-0 flex items-start pt-1">
                      <div className="w-10 h-10 rounded-full border-2 border-accent/30 flex items-center justify-center">
                        <span className="text-lg text-accent font-serif leading-none select-none">
                          "
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="prose prose-stone max-w-none text-text-body leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: t.content }}
                      />
                      <footer className="mt-4 flex items-center gap-3">
                        <div className="w-6 h-px bg-accent/40" />
                        <p className="font-sans font-semibold text-sm text-primary">{t.author}</p>
                        {t.publishedAt && (
                          <>
                            <span className="text-text-muted/40">·</span>
                            <time className="text-xs font-sans text-text-muted">
                              {formatDate(t.publishedAt)}
                            </time>
                          </>
                        )}
                      </footer>
                    </div>
                  </blockquote>
                </Container>
              )}
            </div>
          );
        })}
      </div>

      {testimonials.length > 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted italic text-sm font-serif">✦ Namastê ✦</p>
        </div>
      )}
    </div>
  );
}
