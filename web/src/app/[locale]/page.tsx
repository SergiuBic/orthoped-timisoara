import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getContent, getSettings } from "@/lib/content";
import { buildHomeMetadata } from "@/lib/seo/metadata";
import { JsonLd, faqJsonLd, personJsonLd, physicianJsonLd } from "@/lib/seo/jsonld";
import { Hero } from "@/components/site/hero";
import { TrustStrip } from "@/components/site/trust-strip";
import { KneeStory } from "@/components/site/knee-story";
import { ServicesSection } from "@/components/site/services-section";
import { TraumaStory } from "@/components/site/trauma-story";
import { AboutSection } from "@/components/site/about-section";
import { ProcessSection } from "@/components/site/process-section";
import { FaqSection } from "@/components/site/faq-section";
import { ContactSection } from "@/components/site/contact-section";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildHomeMetadata(locale);
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [c, settings] = await Promise.all([getContent(locale), getSettings()]);
  const city = settings.address.city[locale];

  return (
    <>
      <JsonLd data={physicianJsonLd(settings, c, locale)} />
      <JsonLd data={personJsonLd(settings, c, locale)} />
      <JsonLd data={faqJsonLd(c.faq)} />
      <Hero hero={c.hero} settings={settings} city={city} />
      <TrustStrip data={c.trust} />
      <KneeStory data={c.kneeStory} />
      <ServicesSection data={c.services} />
      <TraumaStory data={c.traumaStory} />
      <AboutSection data={c.about} settings={settings} />
      <ProcessSection data={c.process} />
      <FaqSection data={c.faq} />
      <ContactSection data={c.contact} settings={settings} locale={locale} city={city} />
    </>
  );
}
