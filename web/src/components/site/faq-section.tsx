import { Icon } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import type { ContentOf } from "@/lib/content/types";

export function FaqSection({ data }: { data: ContentOf<"faq"> }) {
  return (
    <Section id="faq" title={data.heading} glow="left">
      <div className="mx-auto max-w-3xl space-y-3">
        {data.items.map((it, i) => (
          <details key={i} className="glass group rounded-3xl px-6 py-4 open:pb-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              {it.q}
              <Icon name="ChevronDown" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{it.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
