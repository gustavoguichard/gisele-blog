import { describe, it, expect } from "vitest";
import { searchContent } from "./search.server";

describe("searchContent", () => {
  it("returns no results without touching the database when the query is empty", async () => {
    const result = await searchContent({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ query: "", results: [] });
    }
  });

  it("returns no results for a query shorter than the minimum", async () => {
    const result = await searchContent({ q: " a " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ query: "a", results: [] });
    }
  });

  it("rejects a query longer than the maximum", async () => {
    const result = await searchContent({ q: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects a non-string query", async () => {
    const result = await searchContent({ q: 123 as unknown as string });
    expect(result.success).toBe(false);
  });
});
