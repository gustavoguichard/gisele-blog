import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/db/db.server", () => ({
  getDb: vi.fn(),
}));

vi.mock("~/services/email.server", () => ({
  sendEmail: vi.fn(),
}));

import { getDb } from "~/db/db.server";
import { checkContactRateLimit, CONTACT_RATE_LIMIT_MAX } from "./contact.server";

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
