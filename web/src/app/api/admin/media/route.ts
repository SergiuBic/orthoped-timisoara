import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdminOrNull } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { IMAGE_MIMES, MAX_IMAGE_BYTES, processImage } from "@/app/admin/_lib/media";


export async function POST(req: Request) {
  if (!(await getAdminOrNull())) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "no_file" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ ok: false, error: "too_large" }, { status: 413 });
  if (!IMAGE_MIMES.includes(file.type)) return Response.json({ ok: false, error: "bad_type" }, { status: 415 });
  try {
    const out = await processImage(Buffer.from(await file.arrayBuffer()));
    const id = randomUUID();
    const dir = path.resolve(process.env.UPLOAD_DIR ?? "./.data/uploads", "media");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.webp`), out.data);
    await db.insert(schema.media).values({
      id, filename: file.name.slice(0, 200), storagePath: `${id}.webp`, mime: "image/webp", width: out.width, height: out.height,
    });
    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ ok: false, error: "bad_image" }, { status: 422 });
  }
}
