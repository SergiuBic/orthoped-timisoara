"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function LoginButton() {
  const t = useTranslations("Admin.login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(false);
          const r = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/admin",
            errorCallbackURL: "/admin/login?error=1",
            newUserCallbackURL: "/admin",
          });
          if (r?.error) { setErr(true); setBusy(false); }
        }}
      >
        {t("google")}
      </Button>
      {err && <p role="alert" className="text-sm text-danger">{t("failed")}</p>}
    </div>
  );
}
