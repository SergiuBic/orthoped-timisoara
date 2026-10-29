import { defineRouting } from "next-intl/routing";

export const locales = ["ro", "en", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ro";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/services/[slug]": { ro: "/servicii/[slug]", en: "/services/[slug]", it: "/servizi/[slug]" },
    "/privacy": { ro: "/confidentialitate", en: "/privacy", it: "/privacy" },
  },
});

// Open Graph / BCP47 tags per locale
export const ogLocale: Record<Locale, string> = { ro: "ro_RO", en: "en_US", it: "it_IT" };
