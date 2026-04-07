import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/env.server", () => ({
  env: vi.fn(),
}));

import { env } from "~/env.server";
import { verifyTurnstileToken } from "./turnstile.server";

describe("verifyTurnstileToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("returns success without calling Cloudflare when secret key is missing", async () => {
    vi.mocked(env).mockReturnValue({ TURNSTILE_SECRET_KEY: undefined } as ReturnType<typeof env>);
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await verifyTurnstileToken("any-token", "1.2.3.4");

    expect(result.success).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns failure when Cloudflare rejects the token", async () => {
    vi.mocked(env).mockReturnValue({
      TURNSTILE_SECRET_KEY: "test-secret",
    } as ReturnType<typeof env>);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false })),
    );

    const result = await verifyTurnstileToken("bad-token", "1.2.3.4");

    expect(result.success).toBe(false);
  });

  it("returns success when Cloudflare accepts the token", async () => {
    vi.mocked(env).mockReturnValue({
      TURNSTILE_SECRET_KEY: "test-secret",
    } as ReturnType<typeof env>);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true })),
    );

    const result = await verifyTurnstileToken("valid-token", "1.2.3.4");

    expect(result.success).toBe(true);
  });
});
