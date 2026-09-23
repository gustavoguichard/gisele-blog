import { describe, it, expect } from "vitest";
import type { Route } from "./+types/root";
import { loader } from "./root";

async function runLoader(url: string) {
  try {
    await loader({ request: new Request(url) } as Route.LoaderArgs);
    return null;
  } catch (thrown) {
    return thrown instanceof Response ? thrown : null;
  }
}

describe("root loader legacy search redirect", () => {
  it("sends WordPress search queries to the search page", async () => {
    const response = await runLoader("https://example.com/?s=medita%C3%A7%C3%A3o");
    expect(response?.status).toBe(301);
    expect(response?.headers.get("Location")).toBe("/busca?q=medita%C3%A7%C3%A3o");
  });

  it("sends an empty WordPress search to the blog", async () => {
    const response = await runLoader("https://example.com/?s=");
    expect(response?.status).toBe(301);
    expect(response?.headers.get("Location")).toBe("/blog");
  });
});
