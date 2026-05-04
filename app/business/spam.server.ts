import { ipAddress } from "@vercel/functions";
import { env } from "~/env.server";

function getClientIp(request: Request): string {
  return ipAddress(request) ?? "unknown";
}

function getTurnstileSiteKey(): string | null {
  return env().TURNSTILE_SITE_KEY ?? null;
}

export { getClientIp, getTurnstileSiteKey };
