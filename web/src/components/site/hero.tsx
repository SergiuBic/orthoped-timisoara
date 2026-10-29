import { Lazy3D } from "@/components/three";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";
import { Glow } from "@/components/ui/glow";
import type { SiteContent, SiteSettings } from "@/lib/content/types";
import { DirectionsButton, PhoneButton, WhatsAppButton } from "./contact-buttons";
import { DoctorPhoto } from "./doctor-photo";
import { OpenNowBadge } from "./open-now-badge";

export function Hero({ hero, settings, city }: { hero: SiteContent["hero"]; settings: SiteSettings; city: string }) {
  const a = settings.address;
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative overflow-hidden"
    >
      <Glow position="center" />
      <div className="container-site grid grid-cols-[minmax(0,1fr)] items-center gap-10 pt-10 pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12 md:pt-16 md:pb-24 [@media(horizontal-viewport-segments:2)]:grid-cols-2 [@media(horizontal-viewport-segments:2)]:gap-x-[calc(env(viewport-segment-left_1_0)-env(viewport-segment-right_0_0))]">
        <div>
          <p className="mb-3 text-sm font-semibold tracking-widest text-peach-deep uppercase">{hero.eyebrow}</p>
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] font-semibold tracking-tight text-balance"
          >
            {hero.h1}
          </h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted">{hero.subtitle}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PhoneButton
              phone={settings.phone}
              phoneDisplay={settings.phoneDisplay}
              showNumber
              label={hero.callCta.label}
              placement="hero"
              size="lg"
            />
            <WhatsAppButton whatsapp={settings.whatsapp} label={hero.whatsappCta.label} placement="hero" size="lg" />
            <DirectionsButton mapsUrl={a.mapsUrl} label={hero.mapsCta.label} placement="hero" size="lg" />
          </div>

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <OpenNowBadge hours={settings.hours} />
            <p className="flex items-start gap-2 text-muted">
              <Icon name="MapPin" className="mt-0.5 size-4 shrink-0" />
              <span>
                {a.street}, {a.postalCode} {city}
              </span>
            </p>
          </div>

          {hero.highlights.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {hero.highlights.map((h) => (
                <li key={h}>
                  <Chip>{h}</Chip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <Lazy3D
            scene="hero"
            className="pointer-events-none absolute -inset-8 -z-10 sm:-inset-12 md:inset-auto md:top-[-8%] md:right-[72%] md:h-[116%] md:w-[min(24rem,34vw)]"
            fallbackAlt=""
          />
          <div className="glass relative aspect-[4/5] overflow-hidden rounded-3xl p-2">
            <div className="relative size-full overflow-hidden rounded-[1.25rem]">
              <DoctorPhoto settings={settings} priority sizes="(min-width: 768px) 448px, 90vw" />
            </div>
          </div>
          <p className="glass mt-4 rounded-2xl px-4 py-3 text-center">
            <span className="font-display block text-lg font-semibold">{settings.doctorName}</span>
            <span className="text-sm text-muted">{settings.doctorTitles}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
