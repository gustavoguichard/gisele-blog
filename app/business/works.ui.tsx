import { Link, href } from "react-router";
import { Highlight } from "~/components/highlight";
import { stripHtml, truncate, hideOnImgError, type ContentCardData } from "~/lib/format";

function WorkCard({ course, query }: { course: ContentCardData; query?: string }) {
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
            <Highlight text={course.title} query={query} />
          </h2>
          {course.excerpt && (
            <p className="text-text-muted leading-relaxed">
              <Highlight text={truncate(stripHtml(course.excerpt), 200)} query={query} />
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

export { WorkCard };
