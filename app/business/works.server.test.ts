import { describe, it, expect } from "vitest";
import { fetchWorkBySlug } from "./works.server";

describe("works schema validation", () => {
  describe("fetchWorkBySlug", () => {
    it("rejects empty slug", async () => {
      const result = await fetchWorkBySlug({ slug: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing slug", async () => {
      const result = await fetchWorkBySlug({} as { slug: string });
      expect(result.success).toBe(false);
    });
  });
});
