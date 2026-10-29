import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-fg",
        className,
      )}
      {...props}
    />
  );
}
