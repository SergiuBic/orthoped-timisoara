import { ingestFile } from "@/lib/ai/ingest";
import { isInternal } from "@/lib/utils";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!isInternal(req)) return new Response("forbidden", { status: 403 });
  const body = (await req.json().catch(() => null)) as { fileId?: string } | null;
  if (!body?.fileId || !/^[0-9a-f-]{36}$/i.test(body.fileId)) return Response.json({ ok: false, error: "fileId required" }, { status: 400 });
  const r = await ingestFile(body.fileId);
  return Response.json({ ok: r.ok, status: r.status, error: r.error });
}
