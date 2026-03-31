import { describe, it, expect } from "vitest";
import {
  SITE,
  generateMeta,
  postSeoMeta,
  websiteJsonLd,
  personJsonLd,
  blogPostingJsonLd,
  courseJsonLd,
  collectionPageJsonLd,
  aboutPageJsonLd,
  reviewsPageJsonLd,
  breadcrumbJsonLd,
  contactPageJsonLd,
} from "./seo";

function findMeta(meta: Record<string, string>[], key: string, by = "name") {
  return meta.find((m) => m[by] === key)?.content;
}

function findProperty(meta: Record<string, string>[], prop: string) {
  return findMeta(meta, prop, "property");
}

const baseInput = {
  title: "Test Page",
  description: "A test description",
  url: "/test",
};

describe("generateMeta", () => {
  it("generates title with site name suffix", () => {
    const meta = generateMeta(baseInput);
    expect(meta.find((m) => "title" in m)).toEqual({
      title: `Test Page — ${SITE.name}`,
    });
  });

  it("uses full title when fullTitle is true", () => {
    const meta = generateMeta({ ...baseInput, fullTitle: true });
    expect(meta.find((m) => "title" in m)).toEqual({ title: "Test Page" });
  });

  it("generates canonical URL", () => {
    const meta = generateMeta(baseInput);
    const canonical = meta.find((m) => "tagName" in m && m.rel === "canonical");
    expect(canonical).toEqual({
      tagName: "link",
      rel: "canonical",
      href: `${SITE.url}/test`,
    });
  });

  it("generates Open Graph tags", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "og:title")).toBe("Test Page");
    expect(findProperty(meta, "og:description")).toBe("A test description");
    expect(findProperty(meta, "og:url")).toBe(`${SITE.url}/test`);
    expect(findProperty(meta, "og:site_name")).toBe(SITE.name);
    expect(findProperty(meta, "og:locale")).toBe(SITE.locale);
    expect(findProperty(meta, "og:type")).toBe("website");
  });

  it("uses dynamic OG image when no image provided", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "og:image")).toBe(
      `${SITE.url}/og-image?title=${encodeURIComponent("Test Page")}`,
    );
    expect(findMeta(meta, "twitter:card")).toBe("summary_large_image");
  });

  it("uses provided image with summary_large_image", () => {
    const meta = generateMeta({
      ...baseInput,
      image: "https://example.com/img.jpg",
    });
    expect(findProperty(meta, "og:image")).toBe("https://example.com/img.jpg");
    expect(findMeta(meta, "twitter:card")).toBe("summary_large_image");
  });

  it("resolves relative image paths to absolute URLs", () => {
    const meta = generateMeta({ ...baseInput, image: "/images/photo.jpg" });
    expect(findProperty(meta, "og:image")).toBe(`${SITE.url}/images/photo.jpg`);
  });

  it("generates Twitter Card tags", () => {
    const meta = generateMeta(baseInput);
    expect(findMeta(meta, "twitter:title")).toBe("Test Page");
    expect(findMeta(meta, "twitter:description")).toBe("A test description");
    expect(findMeta(meta, "twitter:image")).toBe(
      `${SITE.url}/og-image?title=${encodeURIComponent("Test Page")}`,
    );
  });

  it("generates article meta for type article", () => {
    const meta = generateMeta({
      ...baseInput,
      type: "article",
      publishedTime: "2024-06-15T12:00:00Z",
      modifiedTime: new Date("2024-07-01T12:00:00Z"),
    });
    expect(findProperty(meta, "og:type")).toBe("article");
    expect(findProperty(meta, "article:published_time")).toBe("2024-06-15T12:00:00.000Z");
    expect(findProperty(meta, "article:modified_time")).toBe("2024-07-01T12:00:00.000Z");
    expect(findProperty(meta, "article:author")).toBe(SITE.author);
  });

  it("omits article times when null", () => {
    const meta = generateMeta({
      ...baseInput,
      type: "article",
      publishedTime: null,
    });
    expect(findProperty(meta, "article:published_time")).toBeUndefined();
    expect(findProperty(meta, "article:author")).toBe(SITE.author);
  });

  it("does not add article meta for website type", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "article:author")).toBeUndefined();
  });

  it("adds noindex when noIndex is true", () => {
    const meta = generateMeta({ ...baseInput, noIndex: true });
    expect(findMeta(meta, "robots")).toBe("noindex, nofollow");
  });

  it("does not add noindex by default", () => {
    const meta = generateMeta(baseInput);
    expect(findMeta(meta, "robots")).toBeUndefined();
  });

  it("uses custom image dimensions when provided", () => {
    const meta = generateMeta({
      ...baseInput,
      image: "https://example.com/img.jpg",
      imageWidth: 800,
      imageHeight: 400,
    });
    expect(findProperty(meta, "og:image:width")).toBe("800");
    expect(findProperty(meta, "og:image:height")).toBe("400");
  });

  it("uses default dimensions for default image", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "og:image:width")).toBe(String(SITE.defaultImageWidth));
    expect(findProperty(meta, "og:image:height")).toBe(String(SITE.defaultImageHeight));
  });

  it("includes og:image:type as png for dynamic OG fallback", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "og:image:type")).toBe("image/png");
  });

  it("includes og:image:type for webp images", () => {
    const meta = generateMeta({ ...baseInput, image: "/uploads/photo.webp" });
    expect(findProperty(meta, "og:image:type")).toBe("image/webp");
  });

  it("includes og:image:type for png images", () => {
    const meta = generateMeta({ ...baseInput, image: "https://example.com/img.png" });
    expect(findProperty(meta, "og:image:type")).toBe("image/png");
  });

  it("includes og:image:alt using page title", () => {
    const meta = generateMeta(baseInput);
    expect(findProperty(meta, "og:image:alt")).toBe("Test Page");
  });
});

describe("postSeoMeta", () => {
  const post = {
    title: "My Post",
    slug: "my-post",
    content: "<p>Content here</p>",
    excerpt: "<p>Excerpt text</p>",
    featuredImage: "https://example.com/img.jpg",
    publishedAt: "2024-06-15T12:00:00Z",
    updatedAt: "2024-07-01T12:00:00Z",
  };

  it("generates article meta from post data", () => {
    const meta = postSeoMeta(post, "/blog");
    expect(findProperty(meta, "og:type")).toBe("article");
    expect(findProperty(meta, "og:image")).toBe("https://example.com/img.jpg");
    expect(meta.find((m) => "title" in m)).toEqual({
      title: `My Post — ${SITE.name}`,
    });
  });

  it("uses excerpt for description when available", () => {
    const meta = postSeoMeta(post, "/blog");
    expect(findMeta(meta, "description")).toBe("Excerpt text");
  });

  it("falls back to content for description", () => {
    const meta = postSeoMeta({ ...post, excerpt: null }, "/blog");
    expect(findMeta(meta, "description")).toBe("Content here");
  });
});

describe("websiteJsonLd", () => {
  it("returns WebSite schema", () => {
    const result = websiteJsonLd();
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe(SITE.name);
    expect(data.url).toBe(SITE.url);
  });
});

describe("personJsonLd", () => {
  it("returns Person schema with @id", () => {
    const result = personJsonLd();
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("Person");
    expect(data["@id"]).toBe(`${SITE.url}/#person`);
    expect(data.name).toBe(SITE.author);
  });
});

describe("blogPostingJsonLd", () => {
  it("returns BlogPosting schema with all fields", () => {
    const post = {
      title: "My Post",
      slug: "my-post",
      content: "<p>Content</p>",
      excerpt: "<p>Excerpt</p>",
      featuredImage: "https://example.com/img.jpg",
      publishedAt: "2024-06-15T12:00:00Z",
      updatedAt: "2024-07-01T12:00:00Z",
    };
    const result = blogPostingJsonLd(post);
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.headline).toBe("My Post");
    expect(data.image).toBe("https://example.com/img.jpg");
    expect(data.datePublished).toBe("2024-06-15T12:00:00.000Z");
    expect(data.author).toEqual(
      expect.objectContaining({
        "@type": "Person",
        "@id": `${SITE.url}/#person`,
        name: SITE.author,
      }),
    );
    expect(data.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/my-post`,
    });
  });

  it("omits image when not provided", () => {
    const post = {
      title: "No Image",
      slug: "no-image",
      content: "<p>Content</p>",
      excerpt: null,
      featuredImage: null,
      publishedAt: null,
      updatedAt: null,
    };
    const result = blogPostingJsonLd(post);
    expect(result["script:ld+json"]).not.toHaveProperty("image");
  });

  it("converts relative image path to absolute URL", () => {
    const post = {
      title: "Relative Image",
      slug: "relative-image",
      content: "<p>Content</p>",
      excerpt: null,
      featuredImage: "/uploads/2024/photo.webp",
      publishedAt: null,
      updatedAt: null,
    };
    const result = blogPostingJsonLd(post);
    expect(result["script:ld+json"].image).toBe(`${SITE.url}/uploads/2024/photo.webp`);
  });
});

describe("courseJsonLd", () => {
  it("returns Course schema", () => {
    const course = {
      title: "My Course",
      slug: "my-course",
      content: "<p>Course content</p>",
      excerpt: "<p>Course description</p>",
      featuredImage: null,
      publishedAt: null,
      updatedAt: null,
    };
    const result = courseJsonLd(course);
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("Course");
    expect(data.name).toBe("My Course");
    expect(data.provider).toEqual(
      expect.objectContaining({ "@type": "Person", "@id": `${SITE.url}/#person` }),
    );
  });

  it("converts relative image path to absolute URL", () => {
    const course = {
      title: "Course with Image",
      slug: "course-img",
      content: "<p>Content</p>",
      excerpt: null,
      featuredImage: "/uploads/course.webp",
      publishedAt: null,
      updatedAt: null,
    };
    const result = courseJsonLd(course);
    expect(result["script:ld+json"].image).toBe(`${SITE.url}/uploads/course.webp`);
  });
});

describe("collectionPageJsonLd", () => {
  it("returns CollectionPage with ItemList", () => {
    const items = [
      { slug: "post-1", title: "Post 1" },
      { slug: "post-2", title: "Post 2" },
    ];
    const result = collectionPageJsonLd("Blog", "/blog", items, "/blog");
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("CollectionPage");
    expect(data.mainEntity["@type"]).toBe("ItemList");
    expect(data.mainEntity.itemListElement).toHaveLength(2);
    expect(data.mainEntity.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      url: `${SITE.url}/blog/post-1`,
      name: "Post 1",
    });
  });

  it("handles empty items", () => {
    const result = collectionPageJsonLd("Blog", "/blog", [], "/blog");
    expect(result["script:ld+json"].mainEntity.itemListElement).toHaveLength(0);
  });
});

describe("aboutPageJsonLd", () => {
  it("returns AboutPage with Person", () => {
    const result = aboutPageJsonLd();
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("AboutPage");
    expect(data.mainEntity["@type"]).toBe("Person");
    expect(data.mainEntity["@id"]).toBe(`${SITE.url}/#person`);
    expect(data.url).toBe(`${SITE.url}/sobre`);
  });
});

describe("reviewsPageJsonLd", () => {
  it("returns WebPage with Review items", () => {
    const testimonials = [
      {
        author: "Maria Silva",
        content: "<p>Great experience!</p>",
        publishedAt: "2024-01-01T00:00:00Z",
      },
    ];
    const result = reviewsPageJsonLd(testimonials);
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("WebPage");
    expect(data.mainEntity).toHaveLength(1);
    expect(data.mainEntity[0]["@type"]).toBe("Review");
    expect(data.mainEntity[0].author.name).toBe("Maria Silva");
    expect(data.mainEntity[0].reviewBody).toBe("Great experience!");
    expect(data.mainEntity[0].itemReviewed["@id"]).toBe(`${SITE.url}/#person`);
  });

  it("handles testimonials without publishedAt", () => {
    const testimonials = [{ author: "João", content: "<p>Nice!</p>", publishedAt: null }];
    const result = reviewsPageJsonLd(testimonials);
    expect(result["script:ld+json"].mainEntity[0]).not.toHaveProperty("datePublished");
  });
});

describe("breadcrumbJsonLd", () => {
  it("returns BreadcrumbList with correct positions", () => {
    const result = breadcrumbJsonLd([
      { name: "Início", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "My Post", url: "/blog/my-post" },
    ]);
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Início",
      item: `${SITE.url}/`,
    });
    expect(data.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "My Post",
      item: `${SITE.url}/blog/my-post`,
    });
  });

  it("handles absolute URLs", () => {
    const result = breadcrumbJsonLd([{ name: "Home", url: "https://giseledemenezes.com/" }]);
    expect(result["script:ld+json"].itemListElement[0].item).toBe("https://giseledemenezes.com/");
  });
});

describe("contactPageJsonLd", () => {
  it("returns ContactPage with Person", () => {
    const result = contactPageJsonLd();
    const data = result["script:ld+json"];
    expect(data["@type"]).toBe("ContactPage");
    expect(data.mainEntity["@type"]).toBe("Person");
    expect(data.mainEntity["@id"]).toBe(`${SITE.url}/#person`);
    expect(data.url).toBe(`${SITE.url}/contato`);
  });
});
