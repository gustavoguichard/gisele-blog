const PAGE_SLUG_TO_ROUTE: Record<string, string> = {
  "quem-e-gisele-de-menezes": "/sobre",
  agenda: "/",
  blog: "/blog",
  cursos: "/trabalhos",
};

const TYPE_TO_BASE_PATH: Record<string, string> = {
  post: "/blog",
  course: "/trabalhos",
};

function resolvePostRoute(type: string, slug: string): string | null {
  const basePath = TYPE_TO_BASE_PATH[type];
  if (!basePath) return null;
  return `${basePath}/${slug}`;
}

export { PAGE_SLUG_TO_ROUTE, TYPE_TO_BASE_PATH, resolvePostRoute };
