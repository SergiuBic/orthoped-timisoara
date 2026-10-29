// Overview queries. Pure drizzle (no Next imports) so they can be exercised from a tsx script.
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

const TZ = "Europe/Bucharest";
export type Range = 7 | 30 | 90;
export const RANGES: Range[] = [7, 30, 90];
export const parseRange = (v: unknown): Range => (Number(v) === 7 ? 7 : Number(v) === 90 ? 90 : 30);

export type Stats = {
  visitors: number;
  phone: number;
  whatsapp: number;
  maps: number;
  callbacks: number;
  chats: number;
  conversion: number; // 0..1
  daily: { day: string; visitors: number; conversions: number }[];
  placements: { placement: string; clicks: number }[];
  devices: { device: string; count: number }[];
  referrers: { host: string; count: number }[];
  locales: { locale: string; count: number }[];
};

const num = (v: unknown) => Number(v ?? 0);
type Row = Record<string, unknown>;

export async function getStats(days: Range): Promise<Stats> {
  // Start of the first day of the range, in Bucharest local time, expressed as timestamptz.
  const since = sql`((date_trunc('day', now() AT TIME ZONE ${TZ}) - ${days - 1} * interval '1 day') AT TIME ZONE ${TZ})`;
  const dayExpr = sql`to_char(date_trunc('day', created_at AT TIME ZONE ${TZ}), 'YYYY-MM-DD')`;

  const [daily, placements, devices, referrers, locales] = await Promise.all([
    db.execute(sql`
      SELECT ${dayExpr} AS day,
             count(DISTINCT visitor_hash) FILTER (WHERE type = 'page_view') AS visitors,
             count(*) FILTER (WHERE type IN ('click_phone','click_whatsapp','lead_submit','chat_lead')) AS conversions,
             count(*) FILTER (WHERE type = 'click_phone') AS phone,
             count(*) FILTER (WHERE type = 'click_whatsapp') AS whatsapp,
             count(*) FILTER (WHERE type = 'click_maps') AS maps,
             count(*) FILTER (WHERE type IN ('lead_submit','chat_lead')) AS callbacks,
             count(DISTINCT visitor_hash) FILTER (WHERE type = 'chat_message') AS chats
      FROM events WHERE created_at >= ${since} GROUP BY 1 ORDER BY 1`),
    db.execute(sql`
      SELECT coalesce(placement, 'n/a') AS placement, count(*) AS clicks FROM events
      WHERE created_at >= ${since} AND type IN ('click_phone','click_whatsapp','click_maps','click_email')
      GROUP BY 1 ORDER BY 2 DESC`),
    db.execute(sql`
      SELECT coalesce(device, 'n/a') AS device, count(*) AS count FROM events
      WHERE created_at >= ${since} AND type = 'page_view' GROUP BY 1 ORDER BY 2 DESC`),
    db.execute(sql`
      SELECT referrer_host AS host, count(*) AS count FROM events
      WHERE created_at >= ${since} AND type = 'page_view' AND referrer_host IS NOT NULL AND referrer_host <> ''
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    db.execute(sql`
      SELECT coalesce(locale, 'n/a') AS locale, count(*) AS count FROM events
      WHERE created_at >= ${since} AND type = 'page_view' GROUP BY 1 ORDER BY 2 DESC`),
  ]);

  // Fill missing days with zeros (keys are Bucharest-local dates).
  const byDay = new Map<string, Row>();
  for (const r of daily as unknown as Row[]) byDay.set(String(r.day), r);
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  const [y, m, d] = todayKey.split("-").map(Number);
  const series: Stats["daily"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10);
    const r = byDay.get(key);
    series.push({ day: key, visitors: num(r?.visitors), conversions: num(r?.conversions) });
  }

  let visitors = 0, phone = 0, whatsapp = 0, maps = 0, callbacks = 0, chats = 0;
  for (const r of byDay.values()) {
    visitors += num(r.visitors); phone += num(r.phone); whatsapp += num(r.whatsapp);
    maps += num(r.maps); callbacks += num(r.callbacks); chats += num(r.chats);
  }
  return {
    visitors, phone, whatsapp, maps, callbacks, chats,
    conversion: visitors > 0 ? Math.min(1, (phone + whatsapp + callbacks) / visitors) : 0,
    daily: series,
    placements: (placements as unknown as Row[]).map((r) => ({ placement: String(r.placement), clicks: num(r.clicks) })),
    devices: (devices as unknown as Row[]).map((r) => ({ device: String(r.device), count: num(r.count) })),
    referrers: (referrers as unknown as Row[]).map((r) => ({ host: String(r.host), count: num(r.count) })),
    locales: (locales as unknown as Row[]).map((r) => ({ locale: String(r.locale), count: num(r.count) })),
  };
}

/** Walk any JSON value and return the paths of strings still containing TODO-DOCTOR. */
export function findTodos(value: unknown, path = ""): string[] {
  if (typeof value === "string") return value.includes("TODO-DOCTOR") ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((v, i) => findTodos(v, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => findTodos(v, path ? `${path}.${k}` : k));
  return [];
}
