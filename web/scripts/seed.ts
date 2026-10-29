// Idempotent: inserts settings only when the singleton rows are missing.
import "dotenv/config";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { aiSettings, siteSettings } from "../src/lib/db/schema";
import { seedAiSettings, seedSettings } from "../src/lib/content/seed";

config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  const s = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.id, 1));
  if (s.length === 0) {
    await db.insert(siteSettings).values({ id: 1, data: seedSettings });
    console.log("seeded site_settings");
  }
  const a = await db.select({ id: aiSettings.id }).from(aiSettings).where(eq(aiSettings.id, 1));
  if (a.length === 0) {
    await db.insert(aiSettings).values({ id: 1, data: seedAiSettings });
    console.log("seeded ai_settings");
  }
  await sql.end();
  console.log("seed done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
