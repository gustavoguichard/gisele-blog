import { Link, href } from "react-router";
import { Highlight } from "~/components/highlight";
import { formatDate, hideOnImgError } from "~/lib/format";
import type { SearchResult } from "./search.server";

function PostSearchResult({ result, query }: { result: SearchResult; query: string }) {
  return (
    <Link
      to={href("/blog/:slug", { slug: result.slug })}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center py-6"
    >
      <div className="w-full sm:w-40 aspect-[16/10] sm:h-28 sm:aspect-auto shrink-0 rounded-xl overflow-hidden bg-bg-warm border border-border">
        {result.featuredImage ? (
          <img
            src={result.featuredImage}
            alt={result.title}
            width={160}
            height={112}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={hideOnImgError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-warm to-border flex items-center justify-center">
            <span className="text-3xl text-accent/40">✦</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {result.publishedAt && (
          <time className="text-xs font-sans text-text-muted tracking-wider uppercase">
            {formatDate(result.publishedAt)}
          </time>
        )}
        <h3 className="text-lg font-bold leading-snug text-primary-dark group-hover:text-primary transition-colors mt-1">
          <Highlight text={result.title} query={query} />
        </h3>
        {result.snippet && (
          <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
            <Highlight text={result.snippet} query={query} />
          </p>
        )}
      </div>
    </Link>
  );
}

export { PostSearchResult };
