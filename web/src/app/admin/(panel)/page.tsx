import { Suspense } from "react";
import Link from "next/link";
import { count, eq, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getRawContent, getSettings } from "@/lib/content";
import { locales } from "@/i18n/routing";
import { GlassCard } from "@/components/ui/glass-card";
import { PageTitle } from "@/components/admin/fields";
import { DailyChart, Donut, PlacementChart } from "@/components/admin/charts";
import { getAdminT } from "../_lib/locale";
import { findTodos, getStats, parseRange, RANGES } from "../_lib/stats";

export const metadata = { title: "Overview" };

async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const days = parseRange((await searchParams).range);
  const { t } = await getAdminT();
  const [s, settings, raws, [errRow], [newRow]] = await Promise.all([
    getStats(days),
    getSettings(),
    Promise.all(locales.map(async (l) => [l, await getRawContent(l)] as const)),
    db.select({ n: count() }).from(schema.knowledgeFiles).where(eq(schema.knowledgeFiles.status, "error")),
    db.select({ n: count() }).from(schema.leads).where(or(eq(schema.leads.status, "new"))),
  ]);
  const todos = [
    ...findTodos(settings, "settings").map((p) => ({ p, href: "/admin/settings" })),
    ...raws.flatMap(([l, c]) => findTodos(c, l).map((p) => ({ p, href: `/admin/content?locale=${l}` }))),
  ];
  const pct = (s.conversion * 100).toFixed(1) + "%";
  const tiles: [string, string | number][] = [
    [t("overview.tiles.visitors"), s.visitors],
    [t("overview.tiles.phone"), s.phone],
    [t("overview.tiles.whatsapp"), s.whatsapp],
    [t("overview.tiles.maps"), s.maps],
    [t("overview.tiles.callbacks"), s.callbacks],
    [t("overview.tiles.chats"), s.chats],
    [t("overview.tiles.conversion"), pct],
  ];
  return (
    <>
      <PageTitle
        title={t("overview.title")}
        actions={
          <div role="group" aria-label={t("overview.range")} className="glass flex rounded-full p-0.5">
            {RANGES.map((r) => (
              <Link key={r} href={`/admin?range=${r}`} aria-current={r === days ? "true" : undefined}
                className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-semibold ${r === days ? "bg-navy text-cloud dark:bg-cloud dark:text-navy" : ""}`}>
                {t("overview.days", { n: r })}
              </Link>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([label, v], i) => (
          <GlassCard key={label} className={`p-4 md:p-5 ${i === 6 ? "col-span-2 sm:col-span-1" : ""}`}>
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</div>
            <div className="mt-1 font-display text-3xl font-semibold" data-testid={`kpi-${i}`}>{v}</div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <GlassCard className="p-4 md:p-6 lg:col-span-3">
          <h2 className="mb-3 font-semibold">{t("overview.charts.daily")}</h2>
          <DailyChart data={s.daily} />
        </GlassCard>
        <GlassCard className="p-4 md:p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold">{t("overview.charts.placements")}</h2>
          <PlacementChart data={s.placements} />
        </GlassCard>
        <GlassCard className="p-4 md:p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold">{t("overview.charts.devices")}</h2>
          <Donut label={t("overview.charts.devices")} data={s.devices.map((d) => ({ name: d.device, value: d.count }))} />
        </GlassCard>
        <GlassCard className="p-4 md:p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold">{t("overview.charts.locales")}</h2>
          <Donut label={t("overview.charts.locales")} data={s.locales.map((d) => ({ name: d.locale.toUpperCase(), value: d.count }))} />
        </GlassCard>
        <GlassCard className="p-4 md:p-6 lg:col-span-1">
          <h2 className="mb-3 font-semibold">{t("overview.referrers")}</h2>
          {s.referrers.length === 0 ? (
            <p className="text-sm text-muted">{t("common.noData")}</p>
          ) : (
            <table className="w-full text-sm"><tbody>
              {s.referrers.map((r) => (
                <tr key={r.host} className="border-b border-navy/5 last:border-0"><td className="truncate py-1.5 pr-2">{r.host}</td><td className="py-1.5 text-right font-semibold">{r.count}</td></tr>
              ))}
            </tbody></table>
          )}
        </GlassCard>
        <GlassCard className="p-4 md:p-6 lg:col-span-5">
          <h2 className="mb-3 font-semibold">{t("overview.attention.title")}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="underline" href="/admin/leads?status=new">{t("overview.attention.newLeads", { n: newRow?.n ?? 0 })}</Link>
            </li>
            <li>
              <Link className="underline" href="/admin/knowledge">{t("overview.attention.errorFiles", { n: errRow?.n ?? 0 })}</Link>
            </li>
            <li>
              {t("overview.attention.todos", { n: todos.length })}
              {todos.length > 0 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-muted">{t("overview.attention.show")}</summary>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto font-mono text-xs">
                    {todos.slice(0, 60).map((x) => <li key={x.p}><Link href={x.href} className="underline">{x.p}</Link></li>)}
                  </ul>
                </details>
              )}
            </li>
          </ul>
        </GlassCard>
      </div>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-muted">…</p>}>
      <Overview searchParams={searchParams} />
    </Suspense>
  );
}
