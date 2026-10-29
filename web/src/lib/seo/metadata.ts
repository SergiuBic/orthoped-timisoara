import "server-only";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getContent, getSettings } from "@/lib/content";
import { locales, ogLocale, type Locale } from "@/i18n/routing";
import { abs, findService, geoRegion, homePath, languageAlternates, privacyPath, servicePath } from "./urls";

async function loadAll() {
  const [settings, ...contents] = await Promise.all([getSettings(), ...locales.map((l) => getContent(l))]);
  const all = Object.fromEntries(locales.map((l, i) => [l, contents[i]])) as Record<Locale, (typeof contents)[number]>;
  return { settings, all };
}

const ROBOTS = { index: true, follow: true, "max-image-preview": "large" as const };

function common(
  settings: Awaited<ReturnType<typeof loadAll>>["settings"],
  locale: Locale,
  path: string,
  title: string,
  description: string,
  imagePath: string,
  languages: Record<string, string>,
): Metadata {
  const url = abs(settings, path);
  const images = [{ url: abs(settings, imagePath), width: 1200, height: 630, alt: title }];
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: settings.clinicName,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    robots: ROBOTS,
  };
}

export async function buildHomeMetadata(locale: Locale): Promise<Metadata> {
  const { settings, all } = await loadAll();
  const c = all[locale];
  const m = common(
    settings, locale, homePath(locale), c.seo.titleTemplate, c.seo.description,
    `${homePath(locale)}/opengraph-image`, languageAlternates(settings, homePath),
  );
  m.keywords = c.seo.keywords;
  const a = settings.address;
  const other: Record<string, string> = {
    "geo.placename": a.city[locale],
    "geo.position": `${a.lat};${a.lng}`,
    ICBM: `${a.lat}, ${a.lng}`,
  };
  const region = geoRegion(settings);
  if (region) other["geo.region"] = region;
  m.other = other;
  return m;
}

export async function buildServiceMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { settings, all } = await loadAll();
  const svc = findService(all[locale], slug);
  if (!svc) return { robots: { index: false, follow: false } };
  const pathFor = (l: Locale) => {
    const s = all[l].services.items.find((x) => x.id === svc.id);
    return s ? servicePath(l, s.slug) : null;
  };
  const path = servicePath(locale, slug);
  return common(settings, locale, path, svc.seoTitle, svc.summary, `/${locale}/services/${encodeURIComponent(slug)}/opengraph-image`, languageAlternates(settings, pathFor));
}

export async function buildPrivacyMetadata(locale: Locale): Promise<Metadata> {
  const { settings, all } = await loadAll();
  const t = await getTranslations({ locale, namespace: "Site.footer" });
  const title = `${t("privacy")} | ${settings.doctorName}`;
  const m = common(settings, locale, privacyPath(locale), title, all[locale].seo.description, `${homePath(locale)}/opengraph-image`, languageAlternates(settings, privacyPath));
  m.robots = { index: true, follow: true };
  return m;
}
