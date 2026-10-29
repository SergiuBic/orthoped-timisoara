import { getTranslations } from "next-intl/server";
import type { SiteSettings } from "@/lib/content";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export async function HoursTable({ hours, locale }: { hours: SiteSettings["hours"]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "Site.hours" });
  return (
    <table className="w-full text-left">
      <caption className="sr-only">{t("title")}</caption>
      <tbody>
        {DAYS.map((d) => {
          const h = hours.find((x) => x.day === d);
          return (
            <tr key={d} className="border-b border-navy/10 last:border-0 dark:border-white/10">
              <th scope="row" className="py-2 pr-4 font-medium">
                {t(`days.${d}`)}
              </th>
              <td className="py-2 text-right tabular-nums">{h ? `${h.opens} – ${h.closes}` : t("closed")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
