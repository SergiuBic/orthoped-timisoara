"use server";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { AiSettingsSchema, TAGS, saveAiSettings } from "@/lib/content";
import { fail, type ActionResult } from "../../_lib/result";

export async function saveAiAction(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  const p = AiSettingsSchema.safeParse(data);
  if (!p.success) return fail(p.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  await saveAiSettings(p.data);
  updateTag(TAGS.ai);
  return { ok: true };
}
