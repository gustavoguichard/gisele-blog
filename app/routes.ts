import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("blog", "./routes/blog.tsx"),
  route("blog/page/:page", "./routes/blog.tsx", { id: "blog-paginated" }),
  route("blog/tag/:slug", "./routes/blog-tag.tsx"),
  route("blog/tag/:slug/page/:page", "./routes/blog-tag.tsx", {
    id: "blog-tag-paginated",
  }),
  route("blog/:slug", "./routes/blog-post.tsx"),
  route("sobre", "./routes/about.tsx"),
  route("depoimentos", "./routes/testimonials.tsx"),
  route("trabalhos", "./routes/trabalhos.tsx"),
  route("trabalhos/:slug", "./routes/trabalho.tsx"),
  route("contato", "./routes/contact.tsx"),
  route("feed.xml", "./routes/feed.ts"),
  route("feed.json", "./routes/feed-json.ts"),
  route("sitemap.xml", "./routes/sitemap.ts"),
  route("robots.txt", "./routes/robots.ts"),
  route("llms.txt", "./routes/llms-txt.ts"),
  route("og-image", "./routes/og-image.ts"),
  route("*", "./routes/wp-catchall.tsx"),
] satisfies RouteConfig;
