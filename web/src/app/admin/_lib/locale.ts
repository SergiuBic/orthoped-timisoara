import { cookies } from "next/headers";
import { createTranslator } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

export const ADMIN_LOCALES = ["it", "en", "ro"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];
export const ADMIN_LOCALE_COOKIE = "admin_locale";

export async function getAdminLocale(): Promise<AdminLocale> {
  const v = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return (ADMIN_LOCALES as readonly string[]).includes(v ?? "") ? (v as AdminLocale) : "it";
}

export async function loadAdminMessages(locale: AdminLocale): Promise<Record<string, unknown>> {
  return (await import(`../../../../messages/${locale}/admin.json`)).default;
}

/** Server-side translator for the Admin namespace with an explicit locale (not the routing locale). */
export async function getAdminT() {
  const locale = await getAdminLocale();
  const messages = await loadAdminMessages(locale);
  const t = createTranslator({ locale, messages: { Admin: messages } as AbstractIntlMessages, namespace: "Admin" });
  return { t: t as unknown as (key: string, values?: Record<string, string | number>) => string, locale, messages };
}
