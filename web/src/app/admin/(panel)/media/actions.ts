"use server";
import { rm } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { TAGS, getSettings, saveSettings } from "@/lib/content";
import { fail, type ActionResult } from "../../_lib/result";

const Id = z.string().uuid();

export async function setAltAction(id: string, alt: Record<string, string>): Promise<ActionResult> {
  await requireAdmin();
  const p = z.object({ id: Id, alt: z.record(z.string(), z.string().max(300)) }).safeParse({ id, alt });
  if (!p.success) return fail("invalid");
  await db.update(schema.media).set({ alt: p.data.alt }).where(eq(schema.media.id, p.data.id));
  updateTag(TAGS.media);
  return { ok: true };
}

export async function setDoctorPhotoAction(id: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (id !== null && !Id.safeParse(id).success) return fail("invalid");
  const s = await getSettings();
  await saveSettings({ ...s, doctorPhotoId: id });
  updateTag(TAGS.settings);
  return { ok: true };
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!Id.safeParse(id).success) return fail("invalid");
  const row = await db.query.media.findFirst({ where: eq(schema.media.id, id) });
  if (!row) return { ok: true };
  const s = await getSettings();
  if (s.doctorPhotoId === id) await saveSettings({ ...s, doctorPhotoId: null });
  await db.delete(schema.media).where(eq(schema.media.id, id));
  await rm(path.join(path.resolve(process.env.UPLOAD_DIR ?? "./.data/uploads", "media"), path.basename(row.storagePath)), { force: true });
  updateTag(TAGS.settings);
  updateTag(TAGS.media);
  return { ok: true };
}
