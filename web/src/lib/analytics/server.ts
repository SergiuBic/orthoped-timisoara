import "server-only";
import { createHash } from "node:crypto";
import { db, schema } from "@/lib/db";

/** Daily-rotating anonymous visitor id. No cookies, no raw IP stored (GDPR-friendly). */
export function visitorHash(ip: string, ua: string) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT ?? "dev-salt";
  return createHash("sha256").update(`${ip}|${ua}|${day}|${salt}`).digest("hex").slice(0, 32);
}

export function clientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "0.0.0.0";
}

export function deviceFrom(width: number, fold: boolean) {
  if (fold) return "fold";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|gptbot|claude|perplexity/i;
export const isBot = (ua: string) => BOT.test(ua);

export async function recordEvent(e: typeof schema.events.$inferInsert) {
  await db.insert(schema.events).values(e);
}
