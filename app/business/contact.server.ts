import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import { z } from "zod";
import { ipAddress } from "@vercel/functions";
import { getDb } from "~/db/db.server";
import { env } from "~/env.server";
import { sendEmail } from "~/services/email.server";
import { verifyTurnstileToken } from "~/services/turnstile.server";
import { contactSchema } from "./contact.common";

function getClientIp(request: Request): string {
  return ipAddress(request) ?? "unknown";
}

function getTurnstileSiteKey(): string | null {
  return env().TURNSTILE_SITE_KEY ?? null;
}

const CONTACT_RATE_LIMIT_MAX = 3;
const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const checkContactRateLimit = composable(async (ip: string) => {
  const db = getDb();
  const windowStart = new Date(Date.now() - CONTACT_RATE_LIMIT_WINDOW_MS);

  const { count } = await db
    .selectFrom("contactAttempts")
    .select(sql<number>`count(*)::int`.as("count"))
    .where("ip", "=", ip)
    .where("createdAt", ">=", windowStart)
    .executeTakeFirstOrThrow();

  if (count >= CONTACT_RATE_LIMIT_MAX) {
    throw new Error("rate_limited");
  }

  await db.insertInto("contactAttempts").values({ ip }).execute();
});

const BLOCKED_WORDS = ["robertlom"];

function isBlocked(name: string, message: string): boolean {
  const combined = `${name} ${message}`.toLowerCase();
  return BLOCKED_WORDS.some((word) => combined.includes(word));
}

const submitContactFormInput = contactSchema.extend({
  "cf-turnstile-response": z.string(),
});

const submitContactFormContext = z.object({
  ip: z.string(),
});

const submitContactForm = applySchema(
  submitContactFormInput,
  submitContactFormContext,
)(async ({ name, email, message, "cf-turnstile-response": turnstileToken }, { ip }) => {
  const rateLimit = await checkContactRateLimit(ip);
  if (!rateLimit.success) {
    throw new Error("rate_limited");
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, ip);
  if (!turnstile.success) {
    throw new Error("turnstile_failed");
  }

  if (isBlocked(name, message)) return;

  await sendEmail({
    replyTo: email,
    subject: `Mensagem de ${name} via blog`,
    text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
  });
});

export {
  checkContactRateLimit,
  CONTACT_RATE_LIMIT_MAX,
  CONTACT_RATE_LIMIT_WINDOW_MS,
  getClientIp,
  getTurnstileSiteKey,
  submitContactForm,
};
