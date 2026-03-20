import { fromSuccess } from "composable-functions";
import { inputFromUrl } from "composable-functions";
import type { Route } from "./+types/blog.index";
import { fetchPostsPaginated, fetchPostsCount, PER_PAGE } from "~/db/queries.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

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

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts, currentPage, totalPages } = loaderData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-center py-12">Nenhuma publicação encontrada.</p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
