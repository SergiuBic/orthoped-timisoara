import { getContent, getSettings } from "@/lib/content";
import { locales, type Locale } from "@/i18n/routing";
import { OG_SIZE, renderOg } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ortoped";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (locales as readonly string[]).includes(locale) ? (locale as Locale) : "ro";
  const [s, c] = await Promise.all([getSettings(), getContent(l)]);
  const svc = c.services.items.find((x) => x.slug === slug);
  return renderOg({
    title: svc?.seoTitle ?? c.hero.h1,
    subtitle: svc ? undefined : c.hero.eyebrow,
    doctor: s.doctorName,
    phone: s.phoneDisplay,
  });
}
