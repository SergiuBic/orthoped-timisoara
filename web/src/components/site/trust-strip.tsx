import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import type { ContentOf } from "@/lib/content/types";

export function TrustStrip({ data }: { data: ContentOf<"trust"> }) {
  return (
    <section aria-label="trust" className="container-site pb-6">
      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {data.items.map((it, i) => (
          <li key={i}>
            <Reveal delay={i * 0.06}>
              <GlassCard as="div" className="h-full p-5 md:p-6">
                <p className="font-display text-2xl font-semibold tracking-tight break-words md:text-3xl">{it.value}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{it.label}</p>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
