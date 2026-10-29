import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/ui/glass-card";
import { Markdown } from "@/components/ui/markdown";
import { routing } from "@/i18n/routing";
import { getContent } from "@/lib/content";
import { buildPrivacyMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildPrivacyMetadata(locale);
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, c] = await Promise.all([getTranslations({ locale, namespace: "Site.footer" }), getContent(locale)]);
  return (
    <div className="container-site max-w-3xl py-16 md:py-24">
      <h1 className="font-display mb-8 text-[clamp(2rem,5vw,3.5rem)] leading-tight font-semibold tracking-tight">
        {t("privacy")}
      </h1>
      <GlassCard>
        <Markdown source={c.legal.privacyBody} />
      </GlassCard>
      <p className="mt-6 text-sm text-muted">{c.legal.medicalDisclaimer}</p>
    </div>
  );
}
