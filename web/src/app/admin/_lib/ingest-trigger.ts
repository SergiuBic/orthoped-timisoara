import "server-only";
import { after } from "next/server";
import { ingestFile } from "@/lib/ai/ingest";

/** Ask n8n to ingest the file; if n8n is unreachable, process it in-process after the response. */
export async function triggerIngest(fileId: string) {
  const base = process.env.N8N_WEBHOOK_BASE;
  let queued = false;
  if (base) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-secret": process.env.INTERNAL_SECRET ?? "" },
        body: JSON.stringify({ fileId }),
        signal: AbortSignal.timeout(3000),
      });
      queued = res.ok;
    } catch {
      queued = false;
    }
  }
  if (!queued) after(() => ingestFile(fileId).catch((e) => console.error("ingest fallback failed", e)));
}
