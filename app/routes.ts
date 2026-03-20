import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("blog", "./routes/blog.index.tsx"),
  route("blog/:slug", "./routes/blog.$slug.tsx"),
  route("sobre", "./routes/about.tsx"),
  route("depoimentos", "./routes/testimonials.tsx"),
] satisfies RouteConfig;
