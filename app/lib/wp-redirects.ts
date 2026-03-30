const PAGE_SLUG_TO_ROUTE: Record<string, string> = {
  "quem-e-gisele-de-menezes": "/sobre",
  agenda: "/",
  blog: "/blog",
  cursos: "/trabalhos",
};

const POST_TYPE_TO_BASE_PATH: Record<string, string> = {
  post: "/blog",
  course: "/trabalhos",
};

function resolvePostRoute(postType: string, slug: string): string | null {
  const basePath = POST_TYPE_TO_BASE_PATH[postType];
  if (!basePath) return null;
  return `${basePath}/${slug}`;
}

export { PAGE_SLUG_TO_ROUTE, POST_TYPE_TO_BASE_PATH, resolvePostRoute };
