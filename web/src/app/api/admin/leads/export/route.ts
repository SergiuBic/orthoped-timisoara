import { desc } from "drizzle-orm";
import { getAdminOrNull } from "@/lib/auth";
import { db, schema } from "@/lib/db";


// CSV-injection safe: cells starting with = + - @ are prefixed with a quote.
const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
};

export async function GET() {
  if (!(await getAdminOrNull())) return new Response("Unauthorized", { status: 401 });
  const rows = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
  const head = ["date", "name", "phone", "source", "locale", "status", "message"];
  const lines = [head.join(",")].concat(
    rows.map((r) => [r.createdAt.toISOString(), r.name, r.phone, r.source, r.locale, r.status, r.message].map(cell).join(",")),
  );
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
