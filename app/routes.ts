import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("blog", "./routes/blog.index.tsx"),
  route("blog/page/:page", "./routes/blog.index.tsx", { id: "blog-paginated" }),
  route("blog/:slug", "./routes/blog.$slug.tsx"),
  route("sobre", "./routes/about.tsx"),
  route("depoimentos", "./routes/testimonials.tsx"),
  route("cursos", "./routes/courses.tsx"),
  route("cursos/:slug", "./routes/courses.$slug.tsx"),
  route("sitemap.xml", "./routes/sitemap.ts"),
  route("robots.txt", "./routes/robots.ts"),
  route("*", "./routes/wp-catchall.tsx"),
] satisfies RouteConfig;
