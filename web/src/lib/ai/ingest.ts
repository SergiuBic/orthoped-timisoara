import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { chunkWithLocale } from "./chunk";
import { embedDocs } from "./embed";
import { parseFile } from "./parse";

const { knowledgeFiles, knowledgeChunks } = schema;

export const MAX_RETRIES = 3;

/** Parse -> chunk -> embed -> replace chunks. Idempotent; never throws (errors land in the row). */
export async function ingestFile(fileId: string): Promise<{ ok: boolean; status: "ready" | "error" | "missing"; error?: string }> {
  const file = await db.query.knowledgeFiles.findFirst({ where: eq(knowledgeFiles.id, fileId) });
  if (!file) return { ok: false, status: "missing", error: "file not found" };

  await db.update(knowledgeFiles).set({ status: "processing", error: null }).where(eq(knowledgeFiles.id, fileId));
  try {
    const parsed = await parseFile(file.storagePath, file.mime);
    const sections = parsed.sections?.length ? parsed.sections : [{ text: parsed.text }];
    const items: { content: string; locale: string; metadata: Record<string, unknown> }[] = [];
    for (const s of sections) {
      for (const c of chunkWithLocale(s.text)) {
        const metadata: Record<string, unknown> = { filename: file.filename };
        if ("page" in s && s.page) metadata.page = s.page;
        if ("sheet" in s && s.sheet) metadata.sheet = s.sheet;
        items.push({ content: c.text, locale: c.locale, metadata });
      }
    }
    if (!items.length) throw new Error("No extractable text in file");

    const vectors = await embedDocs(items.map((i) => i.content));

    await db.transaction(async (tx) => {
      await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.fileId, fileId));
      for (let i = 0; i < items.length; i += 100) {
        await tx.insert(knowledgeChunks).values(
          items.slice(i, i + 100).map((it, j) => ({
            fileId,
            source: "file",
            locale: it.locale,
            content: it.content,
            metadata: it.metadata,
            embedding: vectors[i + j],
          })),
        );
      }
      await tx
        .update(knowledgeFiles)
        .set({ status: "ready", error: null, chunkCount: items.length, processedAt: new Date() })
        .where(eq(knowledgeFiles.id, fileId));
    });
    return { ok: true, status: "ready" };
  } catch (e) {
    const prev = /^\[retry (\d+)\]/.exec(file.error ?? "");
    const n = (prev ? Number(prev[1]) : 0) + 1;
    const msg = `[retry ${n}] ${e instanceof Error ? e.message : String(e)}`.slice(0, 500);
    await db.update(knowledgeFiles).set({ status: "error", error: msg }).where(eq(knowledgeFiles.id, fileId));
    return { ok: false, status: "error", error: msg };
  }
}
