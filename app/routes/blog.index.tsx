import { fromSuccess, inputFromUrl } from "composable-functions";
import type { Route } from "./+types/blog.index";
import { fetchPostsPaginated, fetchPostsCount, PER_PAGE } from "~/db/queries.server";
import { Container } from "~/components/container";
import { PostGrid } from "~/components/post-grid";
import { Pagination } from "~/components/pagination";
import { PageHeader } from "~/components/decorative";

export function meta() {
  return [
    { title: "Blog — Gisele de Menezes" },
    {
      name: "description",
      content:
        "Artigos sobre Ayurveda, saúde holística, espiritualidade e bem-estar por Gisele de Menezes.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const input = inputFromUrl(request);

  const [posts, totalPosts] = await Promise.all([
    fromSuccess(fetchPostsPaginated)(input),
    fromSuccess(fetchPostsCount)(),
  ]);

  const page = Number(input.page) || 1;
  const totalPages = Math.ceil(totalPosts / PER_PAGE);

  return { posts, currentPage: page, totalPages };
}

export function headers() {
  return { "Cache-Control": "private, max-age=0" };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts, currentPage, totalPages } = loaderData;

  return (
    <Container size="xl" className="py-12">
      <PageHeader title="Blog" />

      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <p className="text-text-muted text-center py-12">Nenhuma publicação encontrada.</p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </Container>
  );
}
