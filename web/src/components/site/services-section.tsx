import { Section } from "@/components/ui/section";
import type { ContentOf } from "@/lib/content/types";
import { ServiceCard } from "./service-card";

export function ServicesSection({ data }: { data: ContentOf<"services"> }) {
  return (
    <Section id="services" title={data.heading} intro={data.intro} glow="center">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((it) => (
          <li key={it.id} className="@container">
            <ServiceCard item={it} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
