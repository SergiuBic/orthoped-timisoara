import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = ComponentPropsWithoutRef<"div"> & { as?: "div" | "article" | "li" };

export function GlassCard({ as: Tag = "div", className, ...props }: GlassCardProps) {
  const Cmp = Tag as "div";
  return <Cmp className={cn("glass rounded-3xl p-6 md:p-8", className)} {...props} />;
}
