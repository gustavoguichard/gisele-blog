import { Link } from "react-router";
import { formatDate, stripHtml, truncate } from "~/lib/format";

interface PostListItemProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | string | null;
  };
  basePath?: string;
}

export function PostListItem({ post, basePath = "/blog" }: PostListItemProps) {
  return (
    <Link to={`${basePath}/${post.slug}`} className="group flex gap-6 items-center py-6">
      <div className="w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-bg-warm border border-border">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
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
