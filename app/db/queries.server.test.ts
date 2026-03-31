import { describe, it, expect } from "vitest";
import {
  fetchPostBySlug,
  fetchPostsPaginated,
  fetchWorkBySlug,
  insertComment,
} from "./queries.server";

describe("query schema validation", () => {
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

  describe("insertComment", () => {
    const validInput = {
      postId: "00000000-0000-0000-0000-000000000000",
      parentId: null,
      authorName: "Alice",
      authorEmail: "alice@example.com",
      content: "Hello",
    };

    it("rejects empty authorName", async () => {
      const result = await insertComment({ ...validInput, authorName: "" });
      expect(result.success).toBe(false);
    });

    it("rejects empty content", async () => {
      const result = await insertComment({ ...validInput, content: "" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid postId format", async () => {
      const result = await insertComment({ ...validInput, postId: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid parentId format", async () => {
      const result = await insertComment({ ...validInput, parentId: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", async () => {
      const result = await insertComment({ ...validInput, authorEmail: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("rejects empty email", async () => {
      const result = await insertComment({ ...validInput, authorEmail: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing email", async () => {
      const { authorEmail: _, ...withoutEmail } = validInput;
      const result = await insertComment(withoutEmail as typeof validInput);
      expect(result.success).toBe(false);
    });
  });
});
