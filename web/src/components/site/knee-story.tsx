"use client";

import { Lazy3D } from "@/components/three";
import { Section } from "@/components/ui/section";
import type { ContentOf } from "@/lib/content/types";
import { ScrollSteps } from "./scroll-steps";

export function KneeStory({ data }: { data: ContentOf<"kneeStory"> }) {
  return (
    <Section id="knee" title={data.heading} intro={data.intro} glow="right">
      <ScrollSteps
        steps={data.steps}
        renderVisual={(i) => (
          <Lazy3D
            scene="knee"
            focus={data.steps[i]?.focus}
            className="size-full"
            fallbackAlt={data.steps[i]?.title ?? data.heading}
          />
        )}
      />
    </Section>
  );
}
