import { applySchema, composable } from "composable-functions";
import { sql } from "kysely";
import { ipAddress } from "@vercel/functions";
import { getDb } from "~/db/db.server";
import { sendEmail } from "~/services/email.server";
import { contactSchema, MIN_SUBMIT_TIME_MS } from "./contact.common";

function getClientIp(request: Request): string {
  return ipAddress(request) ?? "unknown";
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

const sendContactEmail = applySchema(contactSchema)(async ({
  name,
  email,
  message,
  _timestamp,
}) => {
  if (Date.now() - _timestamp < MIN_SUBMIT_TIME_MS) {
    throw new Error("spam");
  }

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
  sendContactEmail,
};
