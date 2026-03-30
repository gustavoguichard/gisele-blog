import { NavLink, href } from "react-router";

interface Tag {
  name: string;
  slug: string;
  postCount: number;
}

interface TagMenuProps {
  tags: Tag[];
}

export function TagMenu({ tags }: TagMenuProps) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 mb-10 font-sans text-sm">
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
  );
}
