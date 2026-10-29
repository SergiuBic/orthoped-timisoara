import { getPathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import type { SiteContent, SiteSettings } from "@/lib/content/types";

export const stripSlash = (s: string) => s.replace(/\/+$/, "");

export function homePath(locale: Locale) {
  return getPathname({ locale, href: "/" });
}
export function privacyPath(locale: Locale) {
  return getPathname({ locale, href: "/privacy" });
}
export function servicePath(locale: Locale, slug: string) {
  return getPathname({ locale, href: { pathname: "/services/[slug]", params: { slug } } });
}
export const abs = (settings: SiteSettings, path: string) => stripSlash(settings.siteUrl) + path;

/** hreflang map for a page; `pathFor` returns the path for each locale (or null to skip). */
export function languageAlternates(settings: SiteSettings, pathFor: (l: Locale) => string | null) {
  const out: Record<string, string> = {};
  for (const l of locales) {
    const p = pathFor(l);
    if (p) out[l] = abs(settings, p);
  }
  out["x-default"] = abs(settings, pathFor("ro") ?? homePath("ro"));
  return out;
}

/** Find a service by slug in `locale`, plus its stable id. */
export function findService(content: SiteContent, slug: string) {
  return content.services.items.find((s) => s.slug === slug) ?? null;
}
export function slugFor(allContent: Record<Locale, SiteContent>, id: string, locale: Locale) {
  return allContent[locale].services.items.find((s) => s.id === id)?.slug ?? null;
}

const RO_COUNTIES: Record<string, string> = {
  alba: "AB", arad: "AR", arges: "AG", bacau: "BC", bihor: "BH", bistrita: "BN", botosani: "BT", brasov: "BV",
  braila: "BR", buzau: "BZ", calarasi: "CL", caras: "CS", cluj: "CJ", constanta: "CT", covasna: "CV",
  dambovita: "DB", dolj: "DJ", galati: "GL", giurgiu: "GR", gorj: "GJ", harghita: "HR", hunedoara: "HD",
  ialomita: "IL", iasi: "IS", ilfov: "IF", maramures: "MM", mehedinti: "MH", mures: "MS", neamt: "NT",
  olt: "OT", prahova: "PH", satu: "SM", salaj: "SJ", sibiu: "SB", suceava: "SV", teleorman: "TR",
  timis: "TM", tulcea: "TL", valcea: "VL", vaslui: "VS", vrancea: "VN", bucuresti: "B",
};
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** ISO 3166-2 code, only for RO (county or Bucharest). */
export function geoRegion(settings: SiteSettings): string | null {
  const a = settings.address;
  if (a.countryCode.toUpperCase() !== "RO") return null;
  const code = RO_COUNTIES[norm(a.region)] ?? RO_COUNTIES[norm(a.city.ro)];
  return code ? `RO-${code}` : null;
}
