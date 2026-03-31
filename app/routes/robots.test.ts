import { describe, it, expect } from "vitest";
import { loader } from "./robots";

describe("robots.txt", () => {
  it("returns plain text response", () => {
    const response = loader();
    expect(response.headers.get("Content-Type")).toBe("text/plain");
  });

  it("allows all user agents", async () => {
    const text = await loader().text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Allow: /");
  });

  it("disallows set-theme", async () => {
    const text = await loader().text();
    expect(text).toContain("Disallow: /set-theme");
  });

  it("includes crawl delay", async () => {
    const text = await loader().text();
    expect(text).toContain("Crawl-delay: 1");
  });

  it("explicitly allows facebookexternalhit", async () => {
    const text = await loader().text();
    expect(text).toContain("User-agent: facebookexternalhit");
  });

  it("references llms.txt", async () => {
    const text = await loader().text();
    expect(text).toContain("llms.txt");
  });

  it("includes sitemap URL", async () => {
    const text = await loader().text();
    expect(text).toContain("Sitemap: https://giseledemenezes.com/sitemap.xml");
  });

  it("caches for 24 hours", () => {
    const response = loader();
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400");
  });
});
