import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getAdminOrNull } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Glow } from "@/components/ui/glow";
import { LoginButton } from "@/components/admin/login-button";
import { getAdminT } from "../_lib/locale";

async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminOrNull()) redirect("/admin");
  const { error } = await searchParams;
  const { t, locale, messages } = await getAdminT();
  return (
    <NextIntlClientProvider locale={locale} messages={{ Admin: messages } as never}>
      <GlassCard className="w-full max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold">{t("login.title")}</h1>
        <p className="mt-2 mb-6 text-muted">{t("login.subtitle")}</p>
        {error && <p role="alert" className="mb-4 rounded-2xl bg-danger/10 p-3 text-sm text-danger">{t("login.unauthorized")}</p>}
        <LoginButton />
      </GlassCard>
    </NextIntlClientProvider>
  );
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden p-4">
      <Glow />
      <Suspense fallback={null}>
        <Login searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
