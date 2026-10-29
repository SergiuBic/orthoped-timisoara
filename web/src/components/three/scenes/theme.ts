import { useSyncExternalStore } from "react";

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  return () => {
    mq.removeEventListener("change", cb);
    mo.disconnect();
  };
}

function snapshot(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === "dark") return true;
  if (t === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Live "is the page in dark mode" (the canvas is transparent, so materials adapt to the page). */
export function useDark(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
