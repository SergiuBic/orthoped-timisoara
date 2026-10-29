"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fail, type ActionResult } from "../../_lib/result";

export async function setLeadStatusAction(id: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const p = z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "closed", "spam"]) }).safeParse({ id, status });
  if (!p.success) return fail("invalid");
  await db.update(schema.leads).set({ status: p.data.status }).where(eq(schema.leads.id, p.data.id));
  return { ok: true };
}
