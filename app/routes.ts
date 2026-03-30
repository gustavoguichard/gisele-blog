import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("blog", "./routes/blog.index.tsx"),
  route("blog/page/:page", "./routes/blog.index.tsx", { id: "blog-paginated" }),
  route("blog/tag/:slug", "./routes/blog.tag.$slug.tsx"),
  route("blog/tag/:slug/page/:page", "./routes/blog.tag.$slug.tsx", {
    id: "blog-tag-paginated",
  }),
  route("blog/:slug", "./routes/blog.$slug.tsx"),
  route("sobre", "./routes/about.tsx"),
  route("depoimentos", "./routes/testimonials.tsx"),
  route("trabalhos", "./routes/courses.tsx"),
  route("trabalhos/:slug", "./routes/courses.$slug.tsx"),
  route("contato", "./routes/contact.tsx"),
  route("sitemap.xml", "./routes/sitemap.ts"),
  route("robots.txt", "./routes/robots.ts"),
  route("*", "./routes/wp-catchall.tsx"),
] satisfies RouteConfig;
