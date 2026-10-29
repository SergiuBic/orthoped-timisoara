import { z } from "zod";
import { db, schema } from "@/lib/db";
import { clientIp, recordEvent, visitorHash } from "@/lib/analytics/server";
import { locales } from "@/i18n/routing";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[+0-9 ()-]{6,20}$/),
  message: z.string().trim().max(1000).optional().default(""),
  consent: z.literal(true),
  locale: z.enum(locales),
  website: z.string().optional().default(""),
});

// In-memory rate limit: 5 submissions / hashed IP / hour (single instance).
const WINDOW_MS = 60 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, number[]>();

function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return false;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const b = parsed.data;
  if (b.website) return Response.json({ ok: true }); // honeypot: pretend success

  const ua = req.headers.get("user-agent") ?? "";
  const hash = visitorHash(clientIp(req.headers), ua);
  if (limited(hash)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  try {
    await db.insert(schema.leads).values({
      name: b.name,
      phone: b.phone,
      message: b.message || null,
      source: "form",
      locale: b.locale,
      consent: true,
    });
  } catch {
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
  await recordEvent({
    type: "lead_submit",
    placement: "contact",
    locale: b.locale,
    device: null,
    visitorHash: hash,
  }).catch(() => {});
  return Response.json({ ok: true });
}
