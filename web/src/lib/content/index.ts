// Cached content loaders. Every public read goes through here.
// Invalidation: admin mutations call `updateTag(TAGS.x)`; route handlers call `revalidateTag(TAGS.x, "max")`.
// DB unreachable (e.g. `next build` in Docker) => seed fallback. Container entrypoint calls
// POST /api/internal/revalidate after boot so seed-baked pages are refreshed from DB.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Locale } from "@/i18n/routing";
import {
  AiSettingsSchema,
  ContentSchemas,
  SiteSettingsSchema,
  contentKeys,
  type AiSettings,
  type ContentKey,
  type SiteContent,
  type SiteSettings,
} from "./types";
import { seedAiSettings, seedContent, seedSettings } from "./seed";
import { resolveDeep, type TokenCtx } from "./tokens";

export const TAGS = {
  settings: "settings",
  content: "content",
  contentLocale: (l: Locale) => `content:${l}`,
  ai: "ai-settings",
  media: "media",
} as const;

const skipDb = () => process.env.SKIP_DB === "1";

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("max");
  if (skipDb()) return seedSettings;
  try {
    const row = await db.query.siteSettings.findFirst({ where: eq(schema.siteSettings.id, 1) });
    const parsed = SiteSettingsSchema.safeParse(row?.data);
    return parsed.success ? parsed.data : seedSettings;
  } catch {
    return seedSettings;
  }
}

/** Raw content (tokens NOT resolved) – used by admin editor and AI indexer. */
export async function getRawContent(locale: Locale): Promise<SiteContent> {
  "use cache";
  cacheTag(TAGS.content, TAGS.contentLocale(locale));
  cacheLife("max");
  const base = seedContent[locale];
  if (skipDb()) return base;
  try {
    const rows = await db.select().from(schema.content).where(eq(schema.content.locale, locale));
    const merged = { ...base } as Record<ContentKey, unknown>;
    for (const r of rows) {
      const key = r.key as ContentKey;
      if (!contentKeys.includes(key)) continue;
      const parsed = ContentSchemas[key].safeParse(r.data);
      if (parsed.success) merged[key] = parsed.data;
    }
    return merged as SiteContent;
  } catch {
    return base;
  }
}

/** Public content with {city}/{doctor}/{phone} resolved. */
export async function getContent(locale: Locale): Promise<SiteContent> {
  const [raw, settings] = await Promise.all([getRawContent(locale), getSettings()]);
  return resolveDeep(raw, tokenCtx(settings, locale));
}

export function tokenCtx(settings: SiteSettings, locale: Locale): TokenCtx {
  return { city: settings.address.city[locale], doctor: settings.doctorName, phone: settings.phoneDisplay };
}

export async function getAiSettings(): Promise<AiSettings> {
  "use cache";
  cacheTag(TAGS.ai);
  cacheLife("max");
  if (skipDb()) return seedAiSettings;
  try {
    const row = await db.query.aiSettings.findFirst({ where: eq(schema.aiSettings.id, 1) });
    const parsed = AiSettingsSchema.safeParse(row?.data);
    return parsed.success ? parsed.data : seedAiSettings;
  } catch {
    return seedAiSettings;
  }
}

/** Upsert helpers for admin (validation happens here, callers handle auth + tag invalidation). */
export async function saveContent<K extends ContentKey>(locale: Locale, key: K, data: unknown) {
  const parsed = ContentSchemas[key].parse(data);
  await db
    .insert(schema.content)
    .values({ locale, key, data: parsed })
    .onConflictDoUpdate({
      target: [schema.content.locale, schema.content.key],
      set: { data: parsed, updatedAt: new Date() },
    });
  return parsed;
}

export async function saveSettings(data: unknown) {
  const parsed = SiteSettingsSchema.parse(data);
  await db
    .insert(schema.siteSettings)
    .values({ id: 1, data: parsed })
    .onConflictDoUpdate({ target: schema.siteSettings.id, set: { data: parsed, updatedAt: new Date() } });
  return parsed;
}

export async function saveAiSettings(data: unknown) {
  const parsed = AiSettingsSchema.parse(data);
  await db
    .insert(schema.aiSettings)
    .values({ id: 1, data: parsed })
    .onConflictDoUpdate({ target: schema.aiSettings.id, set: { data: parsed, updatedAt: new Date() } });
  return parsed;
}

export { and, eq };
export * from "./types";
