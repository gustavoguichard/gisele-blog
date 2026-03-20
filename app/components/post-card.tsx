import { Link } from "react-router";
import { formatDate, stripHtml, truncate } from "~/lib/format";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: Date | string | null;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-4 bg-bg-warm">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bg-warm to-border flex items-center justify-center">
              <span className="text-4xl text-text-muted/30">✦</span>
            </div>
          )}
        </div>

        <time className="text-xs font-sans text-text-muted uppercase tracking-wider">
          {formatDate(post.publishedAt)}
        </time>

        <h2 className="text-lg font-bold mt-1 mb-2 group-hover:text-primary transition-colors leading-snug">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-sm text-text-muted leading-relaxed">
            {truncate(stripHtml(post.excerpt))}
          </p>
        )}
      </Link>
    </article>
  );
}
