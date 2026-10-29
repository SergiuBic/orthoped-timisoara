"use client";
import { useEffect, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "./toast";

export function AdminProviders({ locale, messages, children }: { locale: string; messages: Record<string, unknown>; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <NextIntlClientProvider locale={locale} messages={{ Admin: messages } as never}>
      <ToastProvider>{children}</ToastProvider>
    </NextIntlClientProvider>
  );
}
