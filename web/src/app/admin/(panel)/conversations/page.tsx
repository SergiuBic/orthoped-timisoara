import { Suspense } from "react";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { UserCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { GlassCard } from "@/components/ui/glass-card";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Conversations" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Content({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const { t } = await getAdminT();
  const id = (await searchParams).id;
  const sessions = await db.select().from(schema.chatSessions).orderBy(desc(schema.chatSessions.lastMessageAt)).limit(100);
  const msgs = id && UUID.test(id)
    ? await db.select().from(schema.chatMessages).where(eq(schema.chatMessages.sessionId, id)).orderBy(asc(schema.chatMessages.createdAt))
    : [];
  return (
    <>
      <PageTitle title={t("conversations.title")} sub={t("conversations.notice")} />
      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="p-3 md:p-3 lg:col-span-2">
          {sessions.length === 0 && <p className="p-3 text-sm text-muted">{t("conversations.empty")}</p>}
          <ul className="max-h-[70dvh] space-y-1 overflow-y-auto">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/conversations?id=${s.id}`} aria-current={s.id === id ? "true" : undefined}
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm ${s.id === id ? "bg-peach text-navy" : "hover:bg-white/50"}`}>
                  <span>
                    <span className="block font-medium">{s.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                    <span className="text-xs opacity-70">{s.locale.toUpperCase()} · {t("conversations.messages", { n: s.messageCount })}</span>
                  </span>
                  {s.hasLead && <UserCheck className="size-4 shrink-0 text-ok" aria-label={t("conversations.hasLead")} />}
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="p-4 md:p-5 lg:col-span-3">
          {!id ? <p className="text-sm text-muted">{t("conversations.pick")}</p> : msgs.length === 0 ? <p className="text-sm text-muted">{t("conversations.empty")}</p> : (
            <ol className="space-y-3">
              {msgs.map((m) => (
                <li key={m.id} className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-peach text-navy" : "bg-white/70 text-navy"}`}>
                  {m.content}
                  <div className="mt-1 text-[10px] opacity-60">{m.createdAt.toISOString().slice(11, 16)}</div>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>
      </div>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return <Suspense fallback={null}><Content searchParams={searchParams} /></Suspense>;
}
