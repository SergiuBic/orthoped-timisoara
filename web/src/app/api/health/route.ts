import { connection } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function GET() {
  await connection();
  try {
    await Promise.race([
      db.execute(sql`select 1`),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000)),
    ]);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
