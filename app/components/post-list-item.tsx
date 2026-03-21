import { Link, href } from "react-router";
import {
  formatDate,
  stripHtml,
  truncate,
  hideOnImgError,
  type ContentCardData,
} from "~/lib/format";

interface PostListItemProps {
  post: ContentCardData;
}

export function PostListItem({ post }: PostListItemProps) {
  return (
    <Link
      to={href("/blog/:slug", { slug: post.slug })}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center py-6"
    >
      <div className="w-full sm:w-40 aspect-[16/10] sm:h-28 sm:aspect-auto shrink-0 rounded-xl overflow-hidden bg-bg-warm border border-border">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
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
        <time className="text-xs font-sans text-text-muted tracking-wider uppercase">
          {formatDate(post.publishedAt)}
        </time>
        <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors mt-1">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
            {truncate(stripHtml(post.excerpt), 140)}
          </p>
        )}
      </div>
    </Link>
  );
}
