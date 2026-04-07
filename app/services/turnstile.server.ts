import { makeService } from "make-service";
import { z } from "zod";
import { env } from "~/env.server";

const turnstileService = makeService("https://challenges.cloudflare.com/turnstile/v0", {
  headers: { "content-type": "application/json" },
});

const turnstileResponseSchema = z.object({ success: z.boolean() });

async function verifyTurnstileToken(token: string, ip: string) {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true };

  const response = await turnstileService.post("/siteverify", {
    body: { secret, response: token, remoteip: ip },
  });
  return response.json(turnstileResponseSchema);
}

export { verifyTurnstileToken };
