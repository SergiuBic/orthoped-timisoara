"use client";

import { Lazy3D } from "@/components/three";
import { Section } from "@/components/ui/section";
import type { ContentOf } from "@/lib/content/types";
import { ScrollSteps } from "./scroll-steps";

export function TraumaStory({ data }: { data: ContentOf<"traumaStory"> }) {
  return (
    <Section id="trauma" title={data.heading} intro={data.intro} glow="left">
      <ScrollSteps
        steps={data.steps}
        renderVisual={(i) => (
          <Lazy3D
            scene="fracture"
            phase={data.steps[i]?.focus}
            className="size-full"
            fallbackAlt={data.steps[i]?.title ?? data.heading}
          />
        )}
      />
    </Section>
  );
}
