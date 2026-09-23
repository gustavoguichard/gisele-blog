import { Form, href } from "react-router";
import { fromSuccess, inputFromUrl } from "composable-functions";
import type { Route } from "./+types/search";
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH } from "~/business/search.common";
import { searchContent } from "~/business/search.server";
import { PostSearchResult } from "~/business/search.ui";
import { WorkCard } from "~/business/works.ui";
import { GoldDivider } from "~/components/decorative";
import { pluralize } from "~/lib/format";
import { generateMeta } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  return fromSuccess(searchContent)(inputFromUrl(request));
}

export function meta({ loaderData }: Route.MetaArgs) {
  const query = loaderData?.query ?? "";
  return generateMeta({
    title: query ? `Busca: ${query}` : "Busca",
    description: "Busque publicações do blog de Gisele de Menezes.",
    url: href("/busca"),
    noIndex: true,
  });
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { query, results } = loaderData;
  const hasQuery = query.length >= SEARCH_MIN_LENGTH;
  const works = results.filter((result) => result.type === "work");
  const posts = results.filter((result) => result.type === "post");
  const summary = [
    works.length > 0 && pluralize(works.length, "trabalho", "trabalhos"),
    posts.length > 0 && pluralize(posts.length, "publicação", "publicações"),
  ]
    .filter(Boolean)
    .join(" e ");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative mb-10 py-10 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-bg-warm border-b border-border overflow-hidden">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full border border-primary/6 pointer-events-none" />
        <div className="relative text-center">
          <p className="section-label mb-3">✦ Busca ✦</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            {hasQuery ? `Resultados para “${query}”` : "Buscar no blog"}
          </h1>
          {hasQuery && (
            <p className="text-text-muted italic mt-3 max-w-md mx-auto leading-relaxed text-sm">
              {results.length === 0 ? "Nenhum resultado encontrado." : `${summary}.`}
            </p>
          )}
          <GoldDivider />
          <Form
            method="get"
            role="search"
            className="flex items-center max-w-md mx-auto rounded border border-border-dark bg-bg focus-within:border-primary transition-colors"
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              maxLength={SEARCH_MAX_LENGTH}
              autoComplete="off"
              placeholder="Buscar no blog…"
              aria-label="Buscar no blog"
              className="flex-1 min-w-0 h-11 bg-transparent px-4 font-sans text-sm text-text placeholder:text-text-muted outline-none"
            />
            <button
              type="submit"
              className="h-11 px-4 font-sans text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Buscar
            </button>
          </Form>
        </div>
      </div>

      {hasQuery ? (
        results.length > 0 ? (
          <div className="space-y-12">
            {works.length > 0 && (
              <section aria-labelledby="busca-trabalhos">
                <p id="busca-trabalhos" className="section-label text-center mb-8">
                  ✦ Trabalhos ✦
                </p>
                <div className="space-y-6">
                  {works.map((work) => (
                    <WorkCard
                      key={work.id}
                      course={{ ...work, excerpt: work.snippet }}
                      query={query}
                    />
                  ))}
                </div>
              </section>
            )}
            {posts.length > 0 && (
              <section aria-labelledby="busca-publicacoes">
                <p id="busca-publicacoes" className="section-label text-center mb-2">
                  ✦ Publicações ✦
                </p>
                <div className="divide-y divide-border">
                  {posts.map((post) => (
                    <PostSearchResult key={post.id} result={post} query={query} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <p className="text-text-muted text-center py-12">
            Tente outras palavras ou verifique a grafia.
          </p>
        )
      ) : (
        <p className="text-text-muted text-center py-12">
          Digite pelo menos {SEARCH_MIN_LENGTH} caracteres para buscar.
        </p>
      )}
    </div>
  );
}
