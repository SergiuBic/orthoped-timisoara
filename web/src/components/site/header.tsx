"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { PhoneButton } from "./contact-buttons";
import { LocaleSwitcher, type ServiceSlugMap } from "./locale-switcher";

function subscribe(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const scrolled = () => window.scrollY > 16;

const NAV = ["services", "about", "faq", "contact"] as const;

export function Header({
  doctorName,
  phone,
  phoneDisplay,
  slugs,
}: {
  doctorName: string;
  phone: string;
  phoneDisplay: string;
  slugs: ServiceSlugMap;
}) {
  const t = useTranslations("Site");
  const [open, setOpen] = useState(false);
  const small = useSyncExternalStore(subscribe, scrolled, () => false);

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4">
      <div
        className={cn(
          "glass mx-auto flex max-w-6xl items-center gap-3 rounded-full px-4 transition-[padding] duration-300",
          small ? "py-1.5" : "py-3",
        )}
      >
        <Link href="/" className="font-display min-w-0 truncate text-lg font-semibold tracking-tight">
          {doctorName}
        </Link>
        <nav aria-label={t("a11y.nav")} className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((k) => (
            <Link
              key={k}
              href={{ pathname: "/", hash: k }}
              className="rounded-full px-3 py-2 text-sm font-medium hover:bg-peach/40"
            >
              {t(`nav.${k}`)}
            </Link>
          ))}
        </nav>
        <LocaleSwitcher slugs={slugs} className="ml-auto lg:ml-0" />
        <PhoneButton
          phone={phone}
          phoneDisplay={phoneDisplay}
          showNumber
          placement="header"
          className="hidden md:inline-flex"
        />
        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-peach/40 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t("a11y.closeMenu") : t("a11y.openMenu")}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "X" : "Menu"} className="size-6" />
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label={t("a11y.nav")}
          className="glass mx-auto mt-2 flex max-w-6xl flex-col rounded-3xl p-2 lg:hidden"
        >
          {NAV.map((k) => (
            <Link
              key={k}
              href={{ pathname: "/", hash: k }}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-base font-medium hover:bg-peach/40"
            >
              {t(`nav.${k}`)}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
