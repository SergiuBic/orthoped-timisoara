import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteContent, SiteSettings } from "@/lib/content/types";
import { EmailLink } from "./contact-buttons";
import { HoursTable } from "./hours-table";
import { LocaleSwitcher, type ServiceSlugMap } from "./locale-switcher";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer({
  settings,
  locale,
  legal,
  slugs,
}: {
  settings: SiteSettings;
  locale: Locale;
  legal: SiteContent["legal"];
  slugs: ServiceSlugMap;
}) {
  const t = await getTranslations({ locale, namespace: "Site" });
  const a = settings.address;
  const year = await currentYear();
  return (
    <footer className="mt-10 border-t border-navy/10 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10 dark:border-white/10">
      <div className="container-site grid gap-10 py-12 md:grid-cols-3">
        <address className="not-italic">
          <p className="font-display text-xl font-semibold">{settings.doctorName}</p>
          <p className="text-sm text-muted">{settings.doctorTitles}</p>
          <p className="mt-4">{a.street}</p>
          <p>
            {a.postalCode} {a.city[locale]}, {a.region}
          </p>
          <p className="mt-2">
            <a href={`tel:${settings.phone}`} className="font-semibold underline underline-offset-2">
              {settings.phoneDisplay}
            </a>
          </p>
          <EmailLink email={settings.email} placement="footer" className="underline underline-offset-2" />
        </address>
        <div>
          <h2 className="font-display mb-2 text-lg font-semibold">{t("hours.title")}</h2>
          <HoursTable hours={settings.hours} locale={locale} />
        </div>
        <div className="space-y-4">
          <LocaleSwitcher slugs={slugs} />
          <p>
            <Link href="/privacy" className="underline underline-offset-2">
              {t("footer.privacy")}
            </Link>
          </p>
          <p className="text-sm leading-relaxed text-muted">{legal.medicalDisclaimer}</p>
        </div>
      </div>
      <div className="container-site pb-6 text-sm text-muted">
        © {year} {settings.doctorName}. {t("footer.rights")}
      </div>
    </footer>
  );
}
