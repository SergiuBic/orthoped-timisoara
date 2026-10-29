import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/glass-card";
import { Icon } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import type { ContentOf, SiteSettings } from "@/lib/content/types";
import { CallbackForm } from "./callback-form";
import { DirectionsButton, EmailLink, PhoneButton, WhatsAppButton } from "./contact-buttons";
import { HoursTable } from "./hours-table";
import { MapCard } from "./map-card";

export async function ContactSection({
  data,
  settings,
  locale,
  city,
}: {
  data: ContentOf<"contact">;
  settings: SiteSettings;
  locale: string;
  city: string;
}) {
  const t = await getTranslations({ locale, namespace: "Site" });
  const a = settings.address;
  return (
    <Section id="contact" title={data.heading} intro={data.text} glow="center">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="flex flex-col gap-6">
          <MapCard street={a.street} postalCode={a.postalCode} city={city} lat={a.lat} lng={a.lng} mapsUrl={a.mapsUrl} />
          <div>
            <h3 className="font-display mb-2 flex items-center gap-2 text-xl font-semibold">
              <Icon name="Clock" className="size-5 text-peach-deep" />
              {t("hours.title")}
            </h3>
            <HoursTable hours={settings.hours} locale={locale} />
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col gap-6">
          <h3 className="font-display text-2xl font-semibold tracking-tight">{data.formTitle}</h3>
          <CallbackForm />
          <div className="flex flex-col gap-3 border-t border-navy/10 pt-6 sm:flex-row sm:flex-wrap dark:border-white/10">
            <PhoneButton phone={settings.phone} phoneDisplay={settings.phoneDisplay} showNumber placement="contact" />
            <WhatsAppButton whatsapp={settings.whatsapp} placement="contact" />
            <DirectionsButton mapsUrl={a.mapsUrl} placement="contact" />
          </div>
          <EmailLink email={settings.email} placement="contact" className="underline underline-offset-2" />
          <p className="rounded-2xl bg-danger/10 p-4 font-semibold text-danger dark:text-peach">{data.emergencyNote}</p>
        </GlassCard>
      </div>
    </Section>
  );
}
