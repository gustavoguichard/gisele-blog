import { href } from "react-router";
import { ButtonLink } from "~/components/button";
import { fromSuccess } from "composable-functions";
import type { Route } from "./+types/home";
import { fetchRecentPosts, fetchCourses } from "~/db/queries.server";
import { GoldDivider, OrnamentalCircles, PageHeader } from "~/components/decorative";
import { PostListItem } from "~/components/post-list-item";
import { CourseCard } from "~/routes/courses";
import { SITE, generateMeta, websiteJsonLd, personJsonLd } from "~/lib/seo";

export function meta() {
  return [
    ...generateMeta({
      title: SITE.title,
      description: SITE.description,
      url: "/",
      fullTitle: true,
    }),
    websiteJsonLd(),
    personJsonLd(),
  ];
}

export async function loader() {
  const [posts, courses] = await Promise.all([
    fromSuccess(fetchRecentPosts)(5),
    fromSuccess(fetchCourses)(),
  ]);
  return { posts, courses: courses.slice(0, 3) };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts, courses } = loaderData;

  return (
    <div>
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <OrnamentalCircles />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="section-label mb-7">✦ Terapeuta · Escritora · Ayurveda ✦</p>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
            <span className="text-primary">Bem-vinda</span>
            <br />
            <span className="italic font-normal text-text-subtle">ao meu espaço</span>
          </h1>

          <GoldDivider />

          <p className="text-text-muted max-w-md mx-auto leading-relaxed italic">
            Um lugar sagrado para reflexões sobre saúde, espiritualidade e autoconhecimento.
          </p>

          <div className="mt-10 flex gap-3 justify-center font-sans">
            <ButtonLink to={href("/blog")}>Ler o blog</ButtonLink>
            <ButtonLink to={href("/sobre")} variant="secondary">
              Sobre mim
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <PageHeader as="h2" label="Publicações recentes" title="Do blog" />

        <div className="divide-y divide-border">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>

        <div className="text-center mt-10">
          <ButtonLink to={href("/blog")} variant="secondary" className="font-sans">
            Ver todas as publicações
          </ButtonLink>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <PageHeader as="h2" label="Formações" title="Cursos" />

          <div className="space-y-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-10">
            <ButtonLink to={href("/cursos")} variant="secondary" className="font-sans">
              Ver todos os cursos
            </ButtonLink>
          </div>
        </section>
      )}
    </div>
  );
}
