import { isRouteErrorResponse, redirect, useRouteError } from "react-router";
import type { Route } from "./+types/wp-catchall";
import { fetchPostBySlug, fetchWorkBySlug } from "~/db/queries.server";
import { ErrorPage } from "~/components/error-page";
import { PAGE_SLUG_TO_ROUTE } from "~/lib/wp-redirects";

export async function loader({ params, request }: Route.LoaderArgs) {
  const rawPath = params["*"] ?? "";
  const path = rawPath.replace(/\/{2,}/g, "/").replace(/^\/|\/$/g, "");
  const url = new URL(request.url);

  if (path.startsWith("wp-admin") || path.startsWith("wp-login")) {
    throw new Response("Gone", { status: 410 });
  }

  if (path.startsWith("wp-content/uploads/")) {
    const uploadsPath = path.replace(/^wp-content\/uploads\//, "/uploads/");
    const webpPath = uploadsPath
      .replace(/-\d+x\d+(\.\w+)$/, "$1")
      .replace(/\.(jpe?g|png|gif)$/i, ".webp");
    throw redirect(webpPath, 301);
  }

  if (path.startsWith("wp-content/")) {
    throw new Response("Gone", { status: 410 });
  }

  if (path.startsWith("feed") || url.searchParams.has("feed")) {
    throw redirect("/feed.xml", 301);
  }

  if (path.startsWith("category/") || path.startsWith("tag/")) {
    throw redirect("/blog", 301);
  }

  const legacyToBlog = ["album", "evento", "video", "fotos"];
  const legacyToTrabalhos = ["especializacao", "especializacoes", "curso"];
  const legacyToHome = ["banner", "downloads", "livro"];
  const firstSegment = path.split("/")[0];

  if (legacyToBlog.includes(firstSegment)) {
    throw redirect("/blog", 301);
  }

  if (legacyToTrabalhos.includes(firstSegment)) {
    const trSlug = path.split("/").filter(Boolean).pop();
    if (trSlug && trSlug !== firstSegment) {
      throw redirect(`/trabalhos/${trSlug}`, 301);
    }
    throw redirect("/trabalhos", 301);
  }

  if (legacyToHome.includes(firstSegment)) {
    throw redirect("/", 301);
  }

  const slug = path.split("/").filter(Boolean).pop();
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const mappedRoute = PAGE_SLUG_TO_ROUTE[slug];
  if (mappedRoute) {
    throw redirect(mappedRoute, 301);
  }

  const postResult = await fetchPostBySlug({ slug });
  if (postResult.success) {
    throw redirect(`/blog/${postResult.data.slug}`, 301);
  }

  const courseResult = await fetchWorkBySlug({ slug });
  if (courseResult.success) {
    throw redirect(`/trabalhos/${courseResult.data.slug}`, 301);
  }

  throw new Response("Not Found", { status: 404 });
}

export default function WpCatchall() {
  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is410 = isRouteErrorResponse(error) && error.status === 410;
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <ErrorPage
      title={is410 ? "Página removida" : is404 ? "Página não encontrada" : "Erro inesperado"}
      message={
        is410
          ? "Esta página não existe mais."
          : is404
            ? "A página que você procura não existe."
            : "Ocorreu um erro inesperado. Tente novamente."
      }
      linkHref="/"
      linkText="Voltar ao início"
    />
  );
}
