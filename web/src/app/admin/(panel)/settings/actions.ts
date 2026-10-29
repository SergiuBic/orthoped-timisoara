"use server";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { TAGS, saveSettings, SiteSettingsSchema } from "@/lib/content";
import { reindexSite } from "@/lib/ai/index-site";
import { fail, type ActionResult } from "../../_lib/result";
import { geocode } from "../../_lib/geocode";

export async function saveSettingsAction(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = SiteSettingsSchema.safeParse(data);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  try {
    await saveSettings(parsed.data);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "save failed");
  }
  updateTag(TAGS.settings);
  after(() => reindexSite().catch((e) => console.error("reindexSite failed", e)));
  return { ok: true };
}

export async function geocodeAction(query: string): Promise<ActionResult<{ lat: number; lng: number }>> {
  await requireAdmin();
  const q = String(query ?? "").trim().slice(0, 300);
  if (!q) return fail("empty");
  try {
    const r = await geocode(q);
    return r ? { ok: true, data: r } : fail("not_found");
  } catch {
    return fail("geocoder_unavailable");
  }
}
