import { Chip } from "@/components/ui/chip";
import { GlassCard } from "@/components/ui/glass-card";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { Section } from "@/components/ui/section";
import type { ContentOf, SiteSettings } from "@/lib/content/types";
import { DoctorPhoto } from "./doctor-photo";

export function AboutSection({ data, settings }: { data: ContentOf<"about">; settings: SiteSettings }) {
  const social = [
    { name: "LinkedIn", href: settings.social.linkedin },
    { name: "ResearchGate", href: settings.social.researchgate },
    { name: "Facebook", href: settings.social.facebook },
    { name: "Instagram", href: settings.social.instagram },
  ].filter((s): s is { name: string; href: string } => Boolean(s.href));

  return (
    <Section id="about" title={data.heading} glow="right">
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
        <div className="glass relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl p-2 md:mx-0">
          <div className="relative size-full overflow-hidden rounded-[1.25rem]">
            <DoctorPhoto settings={settings} sizes="(min-width: 768px) 320px, 80vw" />
          </div>
        </div>
        <GlassCard>
          <Markdown source={data.body} />
          <ul className="mt-6 flex flex-wrap gap-2">
            {data.credentials.map((c) => (
              <li key={c}>
                <Chip>
                  <Icon name="Award" className="size-4" />
                  {c}
                </Chip>
              </li>
            ))}
            {data.languages.map((l) => (
              <li key={l}>
                <Chip>
                  <Icon name="Languages" className="size-4" />
                  {l}
                </Chip>
              </li>
            ))}
          </ul>
          {social.length ? (
            <ul className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} rel="me noopener" target="_blank" className="underline underline-offset-4 hover:text-peach-deep">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </GlassCard>
      </div>
    </Section>
  );
}
