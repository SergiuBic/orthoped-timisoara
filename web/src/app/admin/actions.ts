"use server";
import { cookies } from "next/headers";
import { ADMIN_LOCALES, ADMIN_LOCALE_COOKIE } from "./_lib/locale";

/** Language switch for the admin UI (cookie only, no auth data involved). */
export async function setAdminLocale(locale: string) {
  if (!(ADMIN_LOCALES as readonly string[]).includes(locale)) return;
  (await cookies()).set(ADMIN_LOCALE_COOKIE, locale, { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
