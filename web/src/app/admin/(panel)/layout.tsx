import { Suspense } from "react";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminProviders } from "@/components/admin/providers";
import { Sidebar, TopBar } from "@/components/admin/shell";
import { getAdminLocale, loadAdminMessages } from "../_lib/locale";

async function Shell({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const locale = await getAdminLocale();
  const [messages, [row]] = await Promise.all([
    loadAdminMessages(locale),
    db.select({ n: count() }).from(schema.leads).where(eq(schema.leads.status, "new")),
  ]);
  return (
    <AdminProviders locale={locale} messages={messages}>
      <Sidebar newLeads={row?.n ?? 0} />
      <div className="px-3 pb-24 md:ml-64 md:pr-4 md:pb-8">
        <TopBar locale={locale} name={session.user.name || session.user.email} image={session.user.image ?? null} />
        <main id="main" className="mx-auto max-w-6xl">{children}</main>
      </div>
    </AdminProviders>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
