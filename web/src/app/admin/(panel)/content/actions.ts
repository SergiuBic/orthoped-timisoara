"use server";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { eq, and } from "drizzle-orm";
import { generateText, Output } from "ai";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ContentSchemas, TAGS, getAiSettings, contentKeys, saveContent, type ContentKey } from "@/lib/content";
import { seedContent } from "@/lib/content/seed";
import { locales, type Locale } from "@/i18n/routing";
import { google } from "@/lib/ai/gemini";
import { reindexSite } from "@/lib/ai/index-site";
import { fail, type ActionResult } from "../../_lib/result";

const isLocale = (l: unknown): l is Locale => (locales as readonly string[]).includes(l as string);
const isKey = (k: unknown): k is ContentKey => contentKeys.includes(k as ContentKey);

export async function saveContentAction(locale: string, key: string, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isLocale(locale) || !isKey(key)) return fail("invalid");
  const parsed = ContentSchemas[key].safeParse(data);
  if (!parsed.success) return fail(parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  try {
    await saveContent(locale, key, parsed.data);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "save failed");
  }
  updateTag(TAGS.content);
  after(() => reindexSite().catch((e) => console.error("reindexSite failed", e)));
  return { ok: true };
}

/** Deletes the DB row and returns the seed default so the form can be refreshed. */
export async function resetContentAction(locale: string, key: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  if (!isLocale(locale) || !isKey(key)) return fail("invalid");
  await db.delete(schema.content).where(and(eq(schema.content.locale, locale), eq(schema.content.key, key)));
  updateTag(TAGS.content);
  after(() => reindexSite().catch((e) => console.error("reindexSite failed", e)));
  return { ok: true, data: seedContent[locale][key] };
}

const FALLBACK_MODEL = "gemini-3.1-flash-lite";
const LANG: Record<Locale, string> = { ro: "Romanian", en: "English", it: "Italian" };

/** Translate the RO form data into `target` with Gemini structured output. Does NOT save. */
export async function translateContentAction(key: string, target: string, roData: unknown): Promise<ActionResult<unknown>> {
  await requireAdmin();
  if (!isKey(key) || !isLocale(target) || target === "ro") return fail("invalid");
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return fail("no_api_key");
  const schemaForKey = ContentSchemas[key];
  const src = schemaForKey.safeParse(roData);
  if (!src.success) return fail("invalid_source");
  try {
    const ai = await getAiSettings();
    const run = (model: string) =>
      generateText({
        model: google(model),
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(90_000),
        output: Output.object({ schema: schemaForKey as never }),
        system:
          `You translate website content for an orthopedic surgeon's clinic from Romanian into ${LANG[target]}. ` +
          "Keep the exact JSON structure. Keep placeholder tokens like {city}, {doctor}, {phone} unchanged and in place. " +
          "Never translate or change `id`, `icon` and `focus` values. Preserve markdown structure (headings, lists, bold, links). " +
          "Localize `slug` fields into natural lowercase URL slugs in the target language (ascii, hyphens, no diacritics). " +
          "Keep medical terminology accurate. Keep strings starting with TODO-DOCTOR prefixed the same way.",
        prompt: JSON.stringify(src.data),
      });
    // Prefer the configured model; fall back to a known-available one if it is retired/unavailable.
    const res = await run(ai.model || FALLBACK_MODEL).catch(() => run(FALLBACK_MODEL));
    const out = schemaForKey.safeParse(res.output);
    if (!out.success) return fail("bad_output");
    return { ok: true, data: out.data };
  } catch (e) {
    console.error("translate failed", e);
    return fail("ai_failed");
  }
}
