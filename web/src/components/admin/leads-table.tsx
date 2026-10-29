"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/glass-card";
import { setLeadStatusAction } from "@/app/admin/(panel)/leads/actions";
import { inputCls } from "./fields";
import { useToast } from "./toast";

type Row = { id: string; name: string; phone: string; message: string | null; source: string; locale: string; status: string; createdAt: string };
const STATUSES = ["new", "contacted", "closed", "spam"] as const;

export function LeadsTable({ rows }: { rows: Row[] }) {
  const t = useTranslations("Admin.leads");
  const toast = useToast();
  const [status, setStatus] = useState<Record<string, string>>(() => Object.fromEntries(rows.map((r) => [r.id, r.status])));
  const [, start] = useTransition();
  if (rows.length === 0) return <p className="text-muted">{t("empty")}</p>;
  return (
    <GlassCard className="overflow-x-auto p-3 md:p-4">
      <table className="w-full min-w-[44rem] text-sm">
        <thead><tr className="text-left text-xs text-muted uppercase">
          <th className="p-2">{t("date")}</th><th>{t("name")}</th><th>{t("phone")}</th><th>{t("source")}</th><th>{t("locale")}</th><th>{t("message")}</th><th>{t("status")}</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-navy/5 align-top">
              <td className="p-2 whitespace-nowrap">{r.createdAt.slice(0, 16).replace("T", " ")}</td>
              <td className="font-medium">{r.name}</td>
              <td><a className="underline" href={`tel:${r.phone.replace(/[^+\d]/g, "")}`}>{r.phone}</a></td>
              <td>{r.source}</td>
              <td className="uppercase">{r.locale}</td>
              <td className="max-w-64 whitespace-pre-wrap">{r.message}</td>
              <td>
                <select aria-label={t("status")} className={`${inputCls} min-h-9 py-1`} value={status[r.id]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatus((s) => ({ ...s, [r.id]: v }));
                    start(async () => { const x = await setLeadStatusAction(r.id, v); if (!x.ok) toast("error", x.error); });
                  }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{t(`st.${s}`)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
