"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin, adminEmails } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fail, type ActionResult } from "../../_lib/result";

const Email = z.string().trim().toLowerCase().pipe(z.email().max(200));

export async function addAdminAction(email: string): Promise<ActionResult> {
  const s = await requireAdmin();
  const p = Email.safeParse(email);
  if (!p.success) return fail("invalid_email");
  await db
    .insert(schema.adminAllowlist)
    .values({ email: p.data, addedBy: s.user.email.toLowerCase() })
    .onConflictDoNothing();
  return { ok: true };
}

export async function removeAdminAction(email: string): Promise<ActionResult> {
  const s = await requireAdmin();
  const e = String(email ?? "").trim().toLowerCase();
  if (e === s.user.email.toLowerCase()) return fail("self");
  if (adminEmails().includes(e)) return fail("owner");
  await db.delete(schema.adminAllowlist).where(eq(schema.adminAllowlist.email, e));
  return { ok: true };
}
