import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getContent, getRawContent, getSettings } from "@/lib/content";
import { buildServiceMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { abs, homePath, servicePath } from "@/lib/seo/urls";
import { GlassCard } from "@/components/ui/glass-card";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { Glow } from "@/components/ui/glow";
import { PhoneButton, WhatsAppButton } from "@/components/site/contact-buttons";
import { ServiceCard } from "@/components/site/service-card";

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) => {
      const c = await getRawContent(locale);
      return c.services.items.map((s) => ({ locale, slug: s.slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildServiceMetadata(locale, slug);
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [c, settings, t] = await Promise.all([
    getContent(locale),
    getSettings(),
    getTranslations({ locale, namespace: "Site" }),
  ]);
  const items = c.services.items;
  const idx = items.findIndex((i) => i.slug === slug);
  if (idx < 0) notFound();
  const item = items[idx];
  const related = [items[(idx + 1) % items.length], items[(idx + 2) % items.length]].filter((r) => r.id !== item.id);

  return (
    <article className="relative">
      <JsonLd data={serviceJsonLd(settings, item, abs(settings, servicePath(locale, item.slug)))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("nav.home"), url: abs(settings, homePath(locale)) },
          { name: item.title, url: abs(settings, servicePath(locale, item.slug)) },
        ])}
      />
      <Glow position="right" />
      <div className="container-site py-10 md:py-16">
        <nav aria-label="breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:underline">
                {t("nav.home")}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href={{ pathname: "/", hash: "services" }} className="hover:underline">
                {t("nav.services")}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-fg">
              {item.title}
            </li>
          </ol>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] font-semibold tracking-tight text-balance">
              {item.seoTitle}
            </h1>
            <p className="mt-4 text-lg text-muted">{item.summary}</p>
            <GlassCard className="mt-8">
              <Markdown source={item.body} />
            </GlassCard>
            <p className="mt-6 text-sm text-muted">{c.legal.medicalDisclaimer}</p>
          </div>

          <aside className="glass flex flex-col gap-3 rounded-3xl p-6 lg:sticky lg:top-24">
            <p className="font-display text-xl font-semibold">{t("service.cta")}</p>
            <PhoneButton phone={settings.phone} phoneDisplay={settings.phoneDisplay} showNumber placement="service_page" />
            <WhatsAppButton whatsapp={settings.whatsapp} placement="service_page" />
          </aside>
        </div>

        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="font-display mb-6 text-2xl font-semibold tracking-tight">
            {t("service.related")}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.id}>
                <ServiceCard item={r} />
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10">
          <Link href={{ pathname: "/", hash: "services" }} className="inline-flex items-center gap-2 font-medium underline underline-offset-4">
            <Icon name="ArrowRight" className="size-4 rotate-180" />
            {t("service.back")}
          </Link>
        </p>
      </div>
    </article>
  );
}
