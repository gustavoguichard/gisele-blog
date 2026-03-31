import { stripHtml, truncate } from "./format";

export const SITE = {
  url: "https://giseledemenezes.com",
  name: "Gisele de Menezes",
  title: "Gisele de Menezes — Terapeuta, Escritora e Praticante de Ayurveda",
  description:
    "Blog de Gisele de Menezes — terapeuta, praticante de Ayurveda, massoterapeuta e escritora. Reflexões sobre saúde, espiritualidade e bem-estar.",
  locale: "pt_BR",
  lang: "pt-BR",
  author: "Gisele de Menezes",
  defaultImage: "/og-default.jpg",
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
} as const;

type SeoInput = {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  image?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
  noIndex?: boolean;
  fullTitle?: boolean;
};

function toAbsoluteUrl(path: string): string;
function toAbsoluteUrl(path: string | null | undefined): string | null;
function toAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path}`;
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function imageTypeFromUrl(url: string): string | null {
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase();
  return ext ? (IMAGE_MIME_TYPES[ext] ?? null) : null;
}

function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}

export function generateMeta(input: SeoInput) {
  const {
    title: rawTitle,
    description,
    url,
    type = "website",
    image,
    imageWidth,
    imageHeight,
    publishedTime,
    modifiedTime,
    noIndex,
    fullTitle,
  } = input;

  const title = fullTitle ? rawTitle : `${rawTitle} — ${SITE.name}`;
  const canonicalUrl = toAbsoluteUrl(url);
  const imageUrl = toAbsoluteUrl(image ?? SITE.defaultImage);
  const hasExplicitImage = !!image;

  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:title", content: rawTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:type", content: type },
    { property: "og:image", content: imageUrl },
    {
      property: "og:image:width",
      content: String(
        hasExplicitImage ? (imageWidth ?? SITE.defaultImageWidth) : SITE.defaultImageWidth,
      ),
    },
    {
      property: "og:image:height",
      content: String(
        hasExplicitImage ? (imageHeight ?? SITE.defaultImageHeight) : SITE.defaultImageHeight,
      ),
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: rawTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { property: "og:image:alt", content: rawTitle },
  ];

  const imageType = imageTypeFromUrl(imageUrl);
  if (imageType) {
    meta.push({ property: "og:image:type", content: imageType });
  }

  if (type === "article") {
    const pub = toISOString(publishedTime);
    const mod = toISOString(modifiedTime);
    if (pub) meta.push({ property: "article:published_time", content: pub });
    if (mod) meta.push({ property: "article:modified_time", content: mod });
    meta.push({ property: "article:author", content: SITE.author });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return meta;
}

type PostLike = {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export function postSeoMeta(post: PostLike, basePath: string) {
  const description = post.excerpt
    ? truncate(stripHtml(post.excerpt), 160)
    : truncate(stripHtml(post.content), 160);

  return generateMeta({
    title: post.title,
    description,
    url: `${basePath}/${post.slug}`,
    type: "article",
    image: post.featuredImage,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export function websiteJsonLd() {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      inLanguage: SITE.lang,
    },
  };
}

function personSchema() {
  return {
    "@type": "Person" as const,
    "@id": `${SITE.url}/#person`,
    name: SITE.author,
    url: SITE.url,
    jobTitle: "Terapeuta",
    description: "Terapeuta, praticante de Ayurveda, massoterapeuta e escritora.",
  };
}

export function personJsonLd() {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      ...personSchema(),
    },
  };
}

export function blogPostingJsonLd(post: PostLike) {
  const description = post.excerpt
    ? truncate(stripHtml(post.excerpt), 160)
    : truncate(stripHtml(post.content), 160);

  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      ...(post.featuredImage ? { image: toAbsoluteUrl(post.featuredImage) } : {}),
      datePublished: toISOString(post.publishedAt),
      dateModified: toISOString(post.updatedAt),
      author: personSchema(),
      publisher: personSchema(),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": toAbsoluteUrl(`/blog/${post.slug}`),
      },
      inLanguage: SITE.lang,
    },
  };
}

export function courseJsonLd(course: PostLike) {
  const description = course.excerpt
    ? truncate(stripHtml(course.excerpt), 160)
    : truncate(stripHtml(course.content), 160);

  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description,
      ...(course.featuredImage ? { image: toAbsoluteUrl(course.featuredImage) } : {}),
      provider: personSchema(),
      inLanguage: SITE.lang,
    },
  };
}

type CollectionItem = { slug: string; title: string };

export function collectionPageJsonLd(
  name: string,
  url: string,
  items: CollectionItem[],
  itemBasePath: string,
) {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      url: toAbsoluteUrl(url),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: toAbsoluteUrl(`${itemBasePath}/${item.slug}`),
          name: item.title,
        })),
      },
    },
  };
}

export function aboutPageJsonLd() {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `Sobre ${SITE.author}`,
      url: toAbsoluteUrl("/sobre"),
      mainEntity: personSchema(),
    },
  };
}

type TestimonialLike = {
  author: string;
  content: string;
  publishedAt: Date | string | null;
};

export function reviewsPageJsonLd(testimonials: TestimonialLike[]) {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Depoimentos",
      url: toAbsoluteUrl("/depoimentos"),
      mainEntity: testimonials.map((t) => ({
        "@type": "Review",
        author: { "@type": "Person", name: t.author },
        reviewBody: truncate(stripHtml(t.content), 300),
        ...(t.publishedAt ? { datePublished: toISOString(t.publishedAt) } : {}),
        itemReviewed: personSchema(),
      })),
    },
  };
}

type BreadcrumbItem = { name: string; url: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: toAbsoluteUrl(item.url),
      })),
    },
  };
}

export function contactPageJsonLd() {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contato",
      url: toAbsoluteUrl("/contato"),
      mainEntity: personSchema(),
    },
  };
}
