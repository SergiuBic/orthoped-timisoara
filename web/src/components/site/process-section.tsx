import { GlassCard } from "@/components/ui/glass-card";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import type { ContentOf } from "@/lib/content/types";

export function ProcessSection({ data }: { data: ContentOf<"process"> }) {
  return (
    <Section id="process" title={data.heading}>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.steps.map((s, i) => (
          <li key={i}>
            <Reveal delay={i * 0.08} className="h-full">
              <GlassCard className="h-full">
                <div className="flex items-center gap-3">
                  <span className="font-display grid size-10 shrink-0 place-items-center rounded-full bg-navy text-lg font-semibold text-cloud dark:bg-cloud dark:text-navy">
                    {i + 1}
                  </span>
                  <Icon name={s.icon} className="size-6 text-peach-deep" />
                </div>
                <h3 className="font-display mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
