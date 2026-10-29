import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Glow } from "./glow";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  glow?: "left" | "right" | "center";
  className?: string;
};

export function Section({ id, eyebrow, title, intro, children, glow, className }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("relative scroll-mt-20", className)}>
      {glow ? <Glow position={glow} /> : null}
      <div className="container-site py-20 md:py-28">
        <header className="mb-10 max-w-3xl md:mb-14">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold tracking-widest text-peach-deep uppercase">{eyebrow}</p>
          ) : null}
          <h2
            id={headingId}
            className="font-display text-[clamp(1.875rem,4vw,3rem)] leading-tight font-semibold tracking-tight text-fg"
          >
            {title}
          </h2>
          {intro ? <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">{intro}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}
