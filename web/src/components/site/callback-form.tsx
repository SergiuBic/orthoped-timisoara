"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const FIELD =
  "mt-1 block w-full rounded-2xl border border-navy/20 bg-white/70 px-4 py-3 text-base text-navy outline-2 outline-offset-2 outline-transparent placeholder:text-navy/50 focus-visible:outline-navy dark:border-white/20 dark:bg-white/10 dark:text-cloud dark:focus-visible:outline-peach";

export function CallbackForm() {
  const t = useTranslations("Site");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(f.get("name") ?? ""),
          phone: String(f.get("phone") ?? ""),
          message: String(f.get("message") ?? ""),
          consent: f.get("consent") === "on",
          website: String(f.get("website") ?? ""),
          locale,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p role="status" className="rounded-2xl bg-peach/40 p-5 text-lg font-medium">
        {t("actions.sent")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium">
        {t("form.name")}
        <input name="name" type="text" required minLength={2} maxLength={80} autoComplete="name" className={FIELD} />
      </label>
      <label className="block text-sm font-medium">
        {t("form.phone")}
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          pattern="[+0-9 ()\-]{6,20}"
          className={FIELD}
        />
      </label>
      <label className="block text-sm font-medium">
        {t("form.message")}
        <textarea name="message" rows={3} maxLength={1000} className={FIELD} />
      </label>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-navy" />
        <span>
          {t.rich("form.consent", {
            link: (chunks) => (
              <Link href="/privacy" className="underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>
      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {t("actions.error")}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? t("actions.sending") : t("actions.send")}
      </Button>
    </form>
  );
}
