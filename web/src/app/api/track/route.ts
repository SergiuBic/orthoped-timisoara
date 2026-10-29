import { z } from "zod";
import { clientIp, deviceFrom, isBot, recordEvent, visitorHash } from "@/lib/analytics/server";

const Body = z.object({
  type: z.enum(["page_view", "click_phone", "click_whatsapp", "click_maps", "click_email", "lead_submit", "chat_open", "chat_message", "chat_lead"]),
  placement: z.string().max(32).optional(),
  path: z.string().max(300).optional(),
  locale: z.string().max(5).optional(),
  referrer: z.string().max(500).optional(),
  w: z.number().int().min(0).max(10000).default(0),
  fold: z.boolean().default(false),
});

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return new Response(null, { status: 204 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const b = parsed.data;
  let referrerHost: string | null = null;
  try {
    referrerHost = b.referrer ? new URL(b.referrer).host : null;
  } catch {}
  await recordEvent({
    type: b.type,
    placement: b.placement,
    path: b.path,
    locale: b.locale,
    referrerHost,
    device: deviceFrom(b.w, b.fold),
    visitorHash: visitorHash(clientIp(req.headers), ua),
  }).catch(() => {});
  return new Response(null, { status: 204 });
}
