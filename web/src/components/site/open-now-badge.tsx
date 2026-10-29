"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { SiteSettings } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const TZ = "Europe/Bucharest";
const DAY_KEYS: Record<string, string> = { Mon: "Mo", Tue: "Tu", Wed: "We", Thu: "Th", Fri: "Fr", Sat: "Sa", Sun: "Su" };

function subscribe(cb: () => void) {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
}

function openState(hours: SiteSettings["hours"]): "open" | "closed" {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAY_KEYS[get("weekday")];
  const now = `${get("hour")}:${get("minute")}`;
  return hours.some((h) => h.day === day && now >= h.opens && now < h.closes) ? "open" : "closed";
}

export function OpenNowBadge({ hours, className }: { hours: SiteSettings["hours"]; className?: string }) {
  const t = useTranslations("Site.hours");
  const state = useSyncExternalStore(
    subscribe,
    () => openState(hours),
    () => "unknown",
  );
  if (state === "unknown") return <span className={cn("inline-block h-7 w-28", className)} aria-hidden="true" />;
  const open = state === "open";
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium", className)}>
      <span
        aria-hidden="true"
        className={cn("size-2.5 rounded-full", open ? "bg-ok shadow-[0_0_0_4px_rgb(47_125_91/0.2)]" : "bg-danger")}
      />
      {open ? t("openNow") : t("closed")}
    </span>
  );
}
