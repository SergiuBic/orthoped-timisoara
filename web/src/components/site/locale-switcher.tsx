"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** service id -> slug per locale */
export type ServiceSlugMap = Record<string, Record<Locale, string>>;

export function LocaleSwitcher({ slugs, className }: { slugs: ServiceSlugMap; className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const t = useTranslations("Site.a11y");

  function go(next: Locale) {
    if (next === locale) return;
    if (pathname === "/services/[slug]" && params.slug) {
      const id = Object.keys(slugs).find((k) => slugs[k][locale] === params.slug);
      if (id) {
        router.replace({ pathname, params: { slug: slugs[id][next] } }, { locale: next });
        return;
      }
      router.replace("/", { locale: next });
      return;
    }
    if (pathname === "/privacy" || pathname === "/") {
      router.replace(pathname, { locale: next });
      return;
    }
    router.replace("/", { locale: next });
  }

  const names = new Intl.DisplayNames([locale], { type: "language" });
  return (
    <div role="group" aria-label={t("language")} className={cn("flex items-center gap-1", className)}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={names.of(l) ?? l}
          aria-pressed={l === locale}
          onClick={() => go(l)}
          className={cn(
            "min-h-9 min-w-9 rounded-full px-2 text-sm font-semibold uppercase outline-2 outline-offset-2 outline-transparent focus-visible:outline-navy dark:focus-visible:outline-peach",
            l === locale ? "bg-navy text-cloud dark:bg-cloud dark:text-navy" : "text-fg hover:bg-peach/40",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
