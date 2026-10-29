import { and, eq, lt, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isInternal } from "@/lib/utils";

const daysAgo = (d: number) => sql`now() - make_interval(days => ${d})`;

export async function POST(req: Request) {
  if (!isInternal(req)) return new Response("forbidden", { status: 403 });
  const sessions = await db.delete(schema.chatSessions).where(lt(schema.chatSessions.createdAt, daysAgo(30))).returning({ id: schema.chatSessions.id });
  const events = await db.delete(schema.events).where(lt(schema.events.createdAt, daysAgo(395))).returning({ id: schema.events.id });
  const leads = await db
    .delete(schema.leads)
    .where(and(eq(schema.leads.status, "spam"), lt(schema.leads.createdAt, daysAgo(30))))
    .returning({ id: schema.leads.id });
  return Response.json({ ok: true, chatSessions: sessions.length, events: events.length, spamLeads: leads.length });
}
