import { desc } from "drizzle-orm";
import { getAdminOrNull } from "@/lib/auth";
import { db, schema } from "@/lib/db";


/** Polled by the Knowledge table every 3 s while any file is pending/processing. */
export async function GET() {
  if (!(await getAdminOrNull())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(schema.knowledgeFiles).orderBy(desc(schema.knowledgeFiles.createdAt));
  return Response.json(
    rows.map((r) => ({ id: r.id, filename: r.filename, size: r.size, status: r.status, error: r.error, chunkCount: r.chunkCount, createdAt: r.createdAt.toISOString() })),
  );
}
