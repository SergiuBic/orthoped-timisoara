import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminOrNull } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { triggerIngest } from "@/app/admin/_lib/ingest-trigger";


const MAX_BYTES = 20 * 1024 * 1024;
const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

export async function POST(req: Request) {
  if (!(await getAdminOrNull())) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ ok: false, error: "too_large" }, { status: 413 });
  const ext = path.extname(file.name).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return Response.json({ ok: false, error: "bad_type" }, { status: 415 });

  const id = randomUUID();
  const safe = path.basename(file.name).replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(-120);
  const dir = path.resolve(process.env.UPLOAD_DIR ?? "./.data/uploads", "knowledge");
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, `${id}-${safe}`);
  await writeFile(storagePath, Buffer.from(await file.arrayBuffer()));
  await db.insert(schema.knowledgeFiles).values({ id, filename: path.basename(file.name).slice(0, 200), mime, size: file.size, storagePath, status: "pending" });
  await triggerIngest(id);
  return Response.json({ ok: true, id });
}
