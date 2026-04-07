import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/db/db.server", () => ({
  getDb: vi.fn(),
}));

vi.mock("~/services/email.server", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("~/services/turnstile.server", () => ({
  verifyTurnstileToken: vi.fn(),
}));

import { getDb } from "~/db/db.server";
import { sendEmail } from "~/services/email.server";
import { verifyTurnstileToken } from "~/services/turnstile.server";
import {
  checkContactRateLimit,
  CONTACT_RATE_LIMIT_MAX,
  getClientIp,
  submitContactForm,
} from "./contact.server";

describe("getClientIp", () => {
  it("reads the client IP from x-real-ip (Vercel's trusted IP header)", () => {
    const req = new Request("http://localhost/contato", {
      headers: { "x-real-ip": "1.2.3.4" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when no x-real-ip header is present", () => {
    const req = new Request("http://localhost/contato");
    expect(getClientIp(req)).toBe("unknown");
  });
});

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

function mockDbUnderLimit() {
  const { chain: insertChain } = makeInsertChain();
  vi.mocked(getDb).mockReturnValue({
    selectFrom: vi.fn().mockReturnValue(makeSelectChain(0)),
    insertInto: vi.fn().mockReturnValue(insertChain),
  } as unknown as ReturnType<typeof getDb>);
}

function mockDbAtLimit() {
  const { chain: insertChain } = makeInsertChain();
  vi.mocked(getDb).mockReturnValue({
    selectFrom: vi.fn().mockReturnValue(makeSelectChain(CONTACT_RATE_LIMIT_MAX)),
    insertInto: vi.fn().mockReturnValue(insertChain),
  } as unknown as ReturnType<typeof getDb>);
}

const validInput = {
  name: "Maria",
  email: "maria@example.com",
  message: "Olá, gostaria de saber mais sobre os cursos.",
  "cf-turnstile-response": "valid-token",
};

const validContext = { ip: "1.2.3.4" };

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

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends email when all checks pass", async () => {
    mockDbUnderLimit();
    vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true });

    const result = await submitContactForm(validInput, validContext);

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("fails when rate limited", async () => {
    mockDbAtLimit();
    vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true });

    const result = await submitContactForm(validInput, validContext);

    expect(result.success).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("fails when Turnstile verification fails", async () => {
    mockDbUnderLimit();
    vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: false });

    const result = await submitContactForm(validInput, validContext);

    expect(result.success).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("silently succeeds without sending email for blocked senders", async () => {
    mockDbUnderLimit();
    vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true });

    const result = await submitContactForm({ ...validInput, name: "RobertLom" }, validContext);

    expect(result.success).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects invalid input via schema validation", async () => {
    const result = await submitContactForm({ ...validInput, email: "not-an-email" }, validContext);

    expect(result.success).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
  });
});
