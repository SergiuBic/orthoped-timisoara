"use server";
import { rm } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { retrieve } from "@/lib/ai/retrieve";
import { reindexSite } from "@/lib/ai/index-site";
import { locales, type Locale } from "@/i18n/routing";
import { fail, type ActionResult } from "../../_lib/result";
import { triggerIngest } from "../../_lib/ingest-trigger";

const Id = z.string().uuid();

export async function reprocessFileAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!Id.safeParse(id).success) return fail("invalid");
  await db.update(schema.knowledgeFiles).set({ status: "pending", error: null }).where(eq(schema.knowledgeFiles.id, id));
  await triggerIngest(id);
  return { ok: true };
}

export async function deleteFileAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!Id.safeParse(id).success) return fail("invalid");
  const row = await db.query.knowledgeFiles.findFirst({ where: eq(schema.knowledgeFiles.id, id) });
  if (!row) return { ok: true };
  await db.delete(schema.knowledgeFiles).where(eq(schema.knowledgeFiles.id, id)); // chunks cascade
  await rm(row.storagePath, { force: true });
  return { ok: true };
}

export async function reindexSiteAction(): Promise<ActionResult<{ chunks: number }>> {
  await requireAdmin();
  try {
    return { ok: true, data: await reindexSite() };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "reindex failed");
  }
}

export type SearchHit = { id: string; content: string; source: string; score: number; file?: string };

export async function testSearchAction(query: string, locale: string): Promise<ActionResult<SearchHit[]>> {
  await requireAdmin();
  const q = String(query ?? "").trim().slice(0, 300);
  if (!q) return fail("empty");
  const loc = ((locales as readonly string[]).includes(locale) ? locale : "ro") as Locale;
  try {
    const hits = await retrieve(q, loc, 6);
    return {
      ok: true,
      data: hits.map((h) => ({
        id: h.id, content: h.content, source: h.source, score: h.score,
        file: typeof h.metadata?.filename === "string" ? h.metadata.filename : undefined,
      })),
    };
  } catch (e) {
    console.error("test search failed", e);
    return fail("search_failed");
  }
}
