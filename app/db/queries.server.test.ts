import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchPostBySlug,
  fetchPostsPaginated,
  fetchWorkBySlug,
  insertComment,
  checkContactRateLimit,
  CONTACT_RATE_LIMIT_MAX,
} from "./queries.server";

vi.mock("~/db/db.server", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "~/db/db.server";

function makeSelectChain(count: number) {
  const chain = {
    select: vi.fn(),
    where: vi.fn(),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue({ count }),
  };
  chain.select.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  return chain;
}

function makeInsertChain() {
  const execute = vi.fn().mockResolvedValue([]);
  const chain = { values: vi.fn().mockReturnThis(), execute };
  return { chain, execute };
}

describe("checkContactRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows submission when under the limit and records the attempt", async () => {
    const { chain: insertChain, execute } = makeInsertChain();
    vi.mocked(getDb).mockReturnValue({
      selectFrom: vi.fn().mockReturnValue(makeSelectChain(0)),
      insertInto: vi.fn().mockReturnValue(insertChain),
    } as unknown as ReturnType<typeof getDb>);

    const result = await checkContactRateLimit("1.2.3.4");

    expect(result.success).toBe(true);
    expect(execute).toHaveBeenCalledOnce();
  });

  it("allows the last submission before the limit and records the attempt", async () => {
    const { chain: insertChain, execute } = makeInsertChain();
    vi.mocked(getDb).mockReturnValue({
      selectFrom: vi.fn().mockReturnValue(makeSelectChain(CONTACT_RATE_LIMIT_MAX - 1)),
      insertInto: vi.fn().mockReturnValue(insertChain),
    } as unknown as ReturnType<typeof getDb>);

    const result = await checkContactRateLimit("1.2.3.4");

    expect(result.success).toBe(true);
    expect(execute).toHaveBeenCalledOnce();
  });

  it("rejects when at the limit and does not record the attempt", async () => {
    const { chain: insertChain, execute } = makeInsertChain();
    vi.mocked(getDb).mockReturnValue({
      selectFrom: vi.fn().mockReturnValue(makeSelectChain(CONTACT_RATE_LIMIT_MAX)),
      insertInto: vi.fn().mockReturnValue(insertChain),
    } as unknown as ReturnType<typeof getDb>);

    const result = await checkContactRateLimit("1.2.3.4");

    expect(result.success).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects when over the limit and does not record the attempt", async () => {
    const { chain: insertChain, execute } = makeInsertChain();
    vi.mocked(getDb).mockReturnValue({
      selectFrom: vi.fn().mockReturnValue(makeSelectChain(CONTACT_RATE_LIMIT_MAX + 5)),
      insertInto: vi.fn().mockReturnValue(insertChain),
    } as unknown as ReturnType<typeof getDb>);

    const result = await checkContactRateLimit("1.2.3.4");

    expect(result.success).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });
});

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
