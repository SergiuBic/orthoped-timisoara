import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { max } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { TAGS } from "@/lib/content";

/** Max updatedAt of settings + content (ISO string; serializable for use cache). */
export async function getLastModified(): Promise<string> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.content);
  cacheLife("max");
  try {
    if (process.env.SKIP_DB === "1") throw new Error("skip");
    const [a] = await db.select({ m: max(schema.siteSettings.updatedAt) }).from(schema.siteSettings);
    const [b] = await db.select({ m: max(schema.content.updatedAt) }).from(schema.content);
    const ts = [a?.m, b?.m].filter((d): d is Date => !!d).map((d) => d.getTime());
    if (ts.length) return new Date(Math.max(...ts)).toISOString();
  } catch {}
  return new Date().toISOString();
}
