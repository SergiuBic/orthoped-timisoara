"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Step = { title: string; text: string };

/** Text steps scroll on the left; a sticky visual (render prop) follows the active step.
 *  Mobile: visual sticks at the top (45dvh), text below. */
export function ScrollSteps({
  steps,
  renderVisual,
}: {
  steps: Step[];
  renderVisual: (activeIndex: number) => ReactNode;
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <div className="md:grid md:grid-cols-2 md:gap-12">
      <div
        className="glass sticky top-20 z-10 mb-6 h-[45dvh] overflow-hidden rounded-3xl md:top-28 md:order-2 md:mb-0 md:h-[min(70dvh,40rem)] md:self-start"
      >
        {renderVisual(active)}
      </div>
      <ol className="space-y-6 md:space-y-0">
        {steps.map((s, i) => (
          <li
            key={i}
            data-index={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="md:flex md:min-h-[60dvh] md:items-center"
          >
            <div
              className={cn(
                "glass w-full rounded-3xl p-6 transition-opacity duration-300 md:p-8",
                i === active ? "opacity-100" : "opacity-70",
              )}
            >
              <p className="text-sm font-semibold tracking-widest text-peach-deep">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
