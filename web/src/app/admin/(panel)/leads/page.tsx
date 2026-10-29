import { Suspense } from "react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { LeadsTable } from "@/components/admin/leads-table";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Leads" };
const STATUSES = ["new", "contacted", "closed", "spam"] as const;

async function Content({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { t } = await getAdminT();
  const sp = (await searchParams).status;
  const status = (STATUSES as readonly string[]).includes(sp ?? "") ? (sp as (typeof STATUSES)[number]) : null;
  const rows = await db.select().from(schema.leads)
    .where(status ? eq(schema.leads.status, status) : undefined)
    .orderBy(desc(schema.leads.createdAt)).limit(500);
  const chip = (active: boolean) => `min-h-9 inline-flex items-center rounded-full px-4 text-sm font-semibold ${active ? "bg-navy text-cloud dark:bg-cloud dark:text-navy" : ""}`;
  return (
    <>
      <PageTitle title={t("leads.title")} actions={
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/api/admin/leads/export" className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"><Download className="size-4" aria-hidden />{t("leads.export")}</a>
      } />
      <div className="glass mb-4 inline-flex flex-wrap rounded-full p-0.5">
        <Link href="/admin/leads" className={chip(!status)}>{t("leads.all")}</Link>
        {STATUSES.map((s) => <Link key={s} href={`/admin/leads?status=${s}`} className={chip(status === s)}>{t(`leads.st.${s}`)}</Link>)}
      </div>
      <LeadsTable rows={rows.map((r) => ({ id: r.id, name: r.name, phone: r.phone, message: r.message, source: r.source, locale: r.locale, status: r.status, createdAt: r.createdAt.toISOString() }))} />
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return <Suspense fallback={null}><Content searchParams={searchParams} /></Suspense>;
}
