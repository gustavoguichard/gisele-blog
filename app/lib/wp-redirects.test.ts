import { describe, it, expect } from "vitest";
import { PAGE_SLUG_TO_ROUTE, TYPE_TO_BASE_PATH, resolvePostRoute } from "./wp-redirects";

describe("PAGE_SLUG_TO_ROUTE", () => {
  it("maps quem-e-gisele-de-menezes to /sobre", () => {
    expect(PAGE_SLUG_TO_ROUTE["quem-e-gisele-de-menezes"]).toBe("/sobre");
  });

  it("maps agenda to /", () => {
    expect(PAGE_SLUG_TO_ROUTE["agenda"]).toBe("/");
  });

  it("maps blog to /blog", () => {
    expect(PAGE_SLUG_TO_ROUTE["blog"]).toBe("/blog");
  });

  it("maps cursos to /trabalhos", () => {
    expect(PAGE_SLUG_TO_ROUTE["cursos"]).toBe("/trabalhos");
  });

  it("returns undefined for unknown slug", () => {
    expect(PAGE_SLUG_TO_ROUTE["unknown-page"]).toBeUndefined();
  });
});

describe("TYPE_TO_BASE_PATH", () => {
  it("maps post to /blog", () => {
    expect(TYPE_TO_BASE_PATH["post"]).toBe("/blog");
  });

  it("maps course to /trabalhos", () => {
    expect(TYPE_TO_BASE_PATH["course"]).toBe("/trabalhos");
  });

  it("returns undefined for unknown type", () => {
    expect(TYPE_TO_BASE_PATH["unknown"]).toBeUndefined();
  });
});

describe("resolvePostRoute", () => {
  it("resolves post type to /blog/:slug", () => {
    expect(resolvePostRoute("post", "meu-post")).toBe("/blog/meu-post");
  });

  it("resolves course type to /trabalhos/:slug", () => {
    expect(resolvePostRoute("course", "curso-de-massagem")).toBe("/trabalhos/curso-de-massagem");
  });

  it("returns null for unknown type", () => {
    expect(resolvePostRoute("page", "alguma-pagina")).toBeNull();
  });

  it("returns null for empty type", () => {
    expect(resolvePostRoute("", "slug")).toBeNull();
  });

  it("preserves slug with special characters", () => {
    expect(resolvePostRoute("post", "slug-com-hifens-e-numeros-123")).toBe(
      "/blog/slug-com-hifens-e-numeros-123",
    );
  });
});
