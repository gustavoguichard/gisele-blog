import { describe, it, expect } from "vitest";
import { fetchPostBySlug, fetchPostsPaginated } from "./posts.server";

describe("posts schema validation", () => {
  describe("fetchPostBySlug", () => {
    it("rejects empty slug", async () => {
      const result = await fetchPostBySlug({ slug: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing slug", async () => {
      const result = await fetchPostBySlug({} as { slug: string });
      expect(result.success).toBe(false);
    });
  });

  describe("fetchPostsPaginated", () => {
    it("rejects negative page number", async () => {
      const result = await fetchPostsPaginated({ page: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects zero page number", async () => {
      const result = await fetchPostsPaginated({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer page number", async () => {
      const result = await fetchPostsPaginated({ page: 1.5 });
      expect(result.success).toBe(false);
    });
  });
});
