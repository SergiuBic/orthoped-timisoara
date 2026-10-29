"use client";
// Cookieless conversion tracking. Fire-and-forget; never blocks navigation (tel:, wa.me, maps).
export type TrackType =
  | "page_view"
  | "click_phone"
  | "click_whatsapp"
  | "click_maps"
  | "click_email"
  | "lead_submit"
  | "chat_open"
  | "chat_message"
  | "chat_lead";

export type Placement = "hero" | "sticky_bar" | "header" | "contact" | "footer" | "service_page" | "chat" | "about";

export function track(type: TrackType, placement?: Placement) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    type,
    placement,
    path: location.pathname,
    locale: document.documentElement.lang,
    referrer: document.referrer,
    w: window.innerWidth,
    fold: matchMedia("(horizontal-viewport-segments: 2), (vertical-viewport-segments: 2)").matches,
  });
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
  }
}
