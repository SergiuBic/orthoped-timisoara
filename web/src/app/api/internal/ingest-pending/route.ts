import { and, asc, eq, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ingestFile, MAX_RETRIES } from "@/lib/ai/ingest";
import { isInternal } from "@/lib/utils";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!isInternal(req)) return new Response("forbidden", { status: 403 });
  const f = schema.knowledgeFiles;
  const retryable = sql`coalesce(substring(${f.error} from '^\\[retry (\\d+)\\]')::int, 0) < ${MAX_RETRIES}`;
  const rows = await db
    .select({ id: f.id })
    .from(f)
    .where(or(eq(f.status, "pending"), and(eq(f.status, "error"), retryable)))
    .orderBy(asc(f.createdAt))
    .limit(5);
  const results = [];
  for (const r of rows) results.push({ id: r.id, ...(await ingestFile(r.id)) });
  return Response.json({ ok: true, processed: results.length, results });
}
