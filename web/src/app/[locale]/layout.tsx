import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { fraunces, inter } from "@/app/fonts";
import "@/app/globals.css";
import { routing, type Locale } from "@/i18n/routing";
import { getContent, getRawContent, getSettings } from "@/lib/content";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { StickyActionBar } from "@/components/site/sticky-action-bar";
import { PageViewTracker } from "@/components/site/page-view-tracker";
import type { ServiceSlugMap } from "@/components/site/locale-switcher";
import { ChatLauncher } from "@/components/chat";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EEE9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1530" },
  ],
};

// Basic fallback; task 07 replaces this with lib/seo.
export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [content, settings] = await Promise.all([getContent(locale), getSettings()]);
  return {
    metadataBase: new URL(settings.siteUrl),
    title: content.seo.titleTemplate,
    description: content.seo.description,
  };
}

async function serviceSlugMap(): Promise<ServiceSlugMap> {
  const all = await Promise.all(routing.locales.map(async (l) => [l, await getRawContent(l)] as const));
  const map: ServiceSlugMap = {};
  for (const [l, c] of all) {
    for (const s of c.services.items) (map[s.id] ??= {} as Record<Locale, string>)[l] = s.slug;
  }
  return map;
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale: raw } = await params;
  if (!hasLocale(routing.locales, raw)) notFound();
  const locale: Locale = raw;
  setRequestLocale(locale);

  const [settings, content, messages, t, slugs] = await Promise.all([
    getSettings(),
    getContent(locale),
    getMessages(),
    getTranslations({ locale, namespace: "Site.a11y" }),
    serviceSlugMap(),
  ]);
  const { Site, Chat } = messages as { Site: Record<string, unknown>; Chat: Record<string, unknown> };

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider locale={locale} messages={{ Site, Chat }}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-cloud"
          >
            {t("skip")}
          </a>
          <Header
            doctorName={settings.doctorName}
            phone={settings.phone}
            phoneDisplay={settings.phoneDisplay}
            slugs={slugs}
          />
          <main id="main">{children}</main>
          <Footer settings={settings} locale={locale} legal={content.legal} slugs={slugs} />
          <StickyActionBar
            phone={settings.phone}
            whatsapp={settings.whatsapp}
            mapsUrl={settings.address.mapsUrl}
          />
          <ChatLauncher locale={locale} />
          <PageViewTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
