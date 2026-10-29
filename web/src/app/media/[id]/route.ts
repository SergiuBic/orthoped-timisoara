import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });
  try {
    const row = await db.query.media.findFirst({ where: eq(schema.media.id, id) });
    if (!row) return new Response("Not found", { status: 404 });
    const dir = path.resolve(process.env.UPLOAD_DIR ?? "./.data/uploads", "media");
    const file = path.join(dir, path.basename(row.storagePath));
    const buf = await readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": row.mime,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
