"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { DirectionsButton, PhoneButton, WhatsAppButton } from "./contact-buttons";

function subscribe(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}
const past30 = () => window.scrollY > window.innerHeight * 0.3;

export function StickyActionBar({ phone, whatsapp, mapsUrl }: { phone: string; whatsapp: string; mapsUrl: string }) {
  const t = useTranslations("Site");
  const visible = useSyncExternalStore(subscribe, past30, () => false);
  const btn = "min-w-0 flex-1 px-2 text-sm";
  return (
    <div
      role="region"
      aria-label={t("a11y.sticky")}
      inert={!visible}
      className={`glass fixed inset-x-0 bottom-0 z-40 flex gap-2 rounded-t-3xl px-3 pt-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <PhoneButton phone={phone} placement="sticky_bar" className={btn} />
      <WhatsAppButton whatsapp={whatsapp} placement="sticky_bar" variant="secondary" className={btn} />
      <DirectionsButton mapsUrl={mapsUrl} placement="sticky_bar" variant="ghost" className={btn} />
    </div>
  );
}
