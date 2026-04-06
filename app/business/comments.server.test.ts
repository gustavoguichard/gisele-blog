import { describe, it, expect } from "vitest";
import { insertComment } from "./comments.server";

describe("comments schema validation", () => {
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
