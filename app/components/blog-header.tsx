import { NavLink, href } from "react-router";
import { GoldDivider } from "./decorative";

interface Tag {
  name: string;
  slug: string;
  postCount: number;
}

interface BlogHeaderProps {
  title: string;
  subtitle?: string;
  tags: Tag[];
}

export function BlogHeader({ title, subtitle, tags }: BlogHeaderProps) {
  return (
    <div className="relative mb-10 py-10 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-bg-warm border-b border-border overflow-hidden">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full border border-primary/6 pointer-events-none" />
      <div className="relative text-center">
        <p className="section-label mb-3">✦ Blog ✦</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">{title}</h1>
        {subtitle && (
          <p className="text-text-muted italic mt-3 max-w-md mx-auto leading-relaxed text-sm">
            {subtitle}
          </p>
        )}
        <GoldDivider />
        <nav className="flex flex-wrap items-center justify-center gap-2 font-sans text-sm">
          <NavLink
            to={href("/blog")}
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-1.5 border transition-colors ${
                isActive
                  ? "bg-primary text-white dark:text-bg border-primary"
                  : "border-border text-text-muted hover:text-primary hover:border-primary/40"
              }`
            }
          >
            Todos
          </NavLink>
          {tags.map((tag) => (
            <NavLink
              key={tag.slug}
              to={href("/blog/tag/:slug", { slug: tag.slug })}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 border transition-colors ${
                  isActive
                    ? "bg-primary text-white dark:text-bg border-primary"
                    : "border-border text-text-muted hover:text-primary hover:border-primary/40"
                }`
              }
            >
              {tag.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
