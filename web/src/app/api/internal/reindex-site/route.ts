import { reindexSite } from "@/lib/ai/index-site";
import { isInternal } from "@/lib/utils";

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!isInternal(req)) return new Response("forbidden", { status: 403 });
  try {
    return Response.json({ ok: true, ...(await reindexSite()) });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
