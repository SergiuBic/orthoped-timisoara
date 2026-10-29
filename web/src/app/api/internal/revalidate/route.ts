import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/content";
import { locales } from "@/i18n/routing";
import { isInternal } from "@/lib/utils";

// Called by the container entrypoint after boot (and by n8n) to drop seed-baked/stale pages.
export async function POST(req: Request) {
  if (!isInternal(req)) return new Response("forbidden", { status: 403 });
  for (const t of [TAGS.settings, TAGS.content, TAGS.ai, TAGS.media, ...locales.map(TAGS.contentLocale)]) {
    revalidateTag(t, { expire: 0 });
  }
  return Response.json({ ok: true });
}
