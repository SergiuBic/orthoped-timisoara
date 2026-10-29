import { getContent, getSettings } from "@/lib/content";
import { locales, type Locale } from "@/i18n/routing";
import { OG_SIZE, renderOg } from "@/lib/seo/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ortoped";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locales as readonly string[]).includes(locale) ? (locale as Locale) : "ro";
  const [s, c] = await Promise.all([getSettings(), getContent(l)]);
  return renderOg({ title: c.hero.h1, subtitle: c.hero.eyebrow, doctor: s.doctorName, phone: s.phoneDisplay });
}
