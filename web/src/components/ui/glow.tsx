import { cn } from "@/lib/utils";

type Position = "left" | "right" | "center";

const POS: Record<Position, string> = {
  left: "-left-1/4 top-0",
  right: "-right-1/4 top-0",
  center: "left-1/2 top-0 -translate-x-1/2",
};

/** Decorative blurred peach/navy blobs. Place inside a `relative` parent. */
export function Glow({ position = "center", className }: { position?: Position; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div
        className={cn("absolute h-[40rem] w-[40rem] max-w-[120vw] opacity-80 blur-3xl", POS[position])}
        style={{ background: "var(--glow)" }}
      />
      <div
        className={cn(
          "absolute h-[24rem] w-[24rem] rounded-full bg-navy-2/10 blur-3xl",
          position === "left" ? "right-0 bottom-0" : "bottom-0 left-0",
        )}
      />
    </div>
  );
}
