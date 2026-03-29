import type { Route } from "./+types/about";
import { fetchPageBySlug } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostContent } from "~/components/post-content";
import { GoldDivider, OrnamentalCircles } from "~/components/decorative";
import { generateMeta, aboutPageJsonLd } from "~/lib/seo";

export function meta() {
  return [
    ...generateMeta({
      title: "Sobre",
      description:
        "Conheça Gisele de Menezes — terapeuta, praticante de Ayurveda, massoterapeuta e escritora.",
      url: "/sobre",
    }),
    aboutPageJsonLd(),
  ];
}

export async function loader() {
  const result = await fetchPageBySlug({ slug: "quem-e-gisele-de-menezes" });
  if (!result.success) {
    throw new Response("Página não encontrada", { status: 404 });
  }
  return { page: result.data };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

function splitContent(html: string) {
  const sections: { heading: string; html: string }[] = [];
  const parts = html.split(/<h2>/i);

  const intro = parts[0].trim();
  for (let i = 1; i < parts.length; i++) {
    const closeIdx = parts[i].indexOf("</h2>");
    const heading = parts[i].substring(0, closeIdx).replace(/ -$/, "").trim();
    const body = parts[i].substring(closeIdx + 5).trim();
    sections.push({ heading, html: body });
  }
  return { intro, sections };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  const { intro, sections } = splitContent(page.content);

  return (
    <div>
      <section className="relative py-14 overflow-hidden bg-bg-warm border-b border-border">
        <OrnamentalCircles />
        <Container>
          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <img
              src="/gisele-de-menezes.webp"
              alt="Gisele de Menezes"
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-accent/30 shadow-lg shrink-0"
            />
            <div className="text-center md:text-left">
              <p className="section-label mb-3">✦ Sobre ✦</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4">
                {page.title}
              </h1>
              <GoldDivider />
              <div
                className="text-text-muted leading-relaxed italic"
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            </div>
          </div>
        </Container>
      </section>

      {sections.map((section, i) => (
        <section key={section.heading} className={i % 2 === 0 ? "py-12" : "py-12 bg-bg-warm"}>
          <Container>
            <h2 className="text-2xl font-bold text-primary mb-2">{section.heading}</h2>
            <GoldDivider />
            <PostContent html={section.html} />
          </Container>
        </section>
      ))}

      <section className="py-12 bg-bg-card border-y border-border -mb-16">
        <Container className="text-center">
          <p className="section-label mb-3">✦ Uma porta aberta ✦</p>
          <h2 className="text-2xl font-bold text-primary mb-4">Quer conversar?</h2>
          <p className="text-text-muted italic mb-6 max-w-md mx-auto">
            Para levar uma dessas palestras, consultas, ou simplesmente trocar uma ideia — ficarei
            feliz em ouvir você.
          </p>
          <a
            href="/contato"
            className="inline-block rounded bg-primary px-6 py-2.5 text-sm font-semibold text-white dark:text-bg border border-primary hover:bg-primary-dark hover:border-primary-dark transition-colors font-sans"
          >
            Entre em contato
          </a>
        </Container>
      </section>
    </div>
  );
}
