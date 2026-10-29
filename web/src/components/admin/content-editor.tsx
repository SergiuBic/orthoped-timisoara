"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Languages, RotateCcw, Save } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ContentSchemas, contentKeys, type ContentKey } from "@/lib/content/types";
import { saveContentAction, resetContentAction, translateContentAction } from "@/app/admin/(panel)/content/actions";
import { ZodForm, humanize } from "./zod-form";
import { SmallBtn } from "./fields";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";

const LOCALES = ["ro", "en", "it"] as const;
type Loc = (typeof LOCALES)[number];
type Data = Record<Loc, Record<string, unknown>>;

export function ContentEditor({ initial, initialLocale }: { initial: Data; initialLocale: Loc }) {
  const t = useTranslations("Admin.content");
  const toast = useToast();
  const [locale, setLocale] = useState<Loc>(initialLocale);
  const [data, setData] = useState<Data>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();

  const setKey = (l: Loc, k: string, v: unknown) => setData((d) => ({ ...d, [l]: { ...d[l], [k]: v } }));
  const run = (id: string, fn: () => Promise<void>) => { setBusy(id); start(async () => { try { await fn(); } finally { setBusy(null); } }); };

  const errText = (e: string) => (e === "no_api_key" ? t("noApiKey") : e === "ai_failed" ? t("aiFailed") : e);

  return (
    <div>
      <div role="tablist" aria-label={t("locale")} className="glass mb-4 inline-flex rounded-full p-0.5">
        {LOCALES.map((l) => (
          <button key={l} role="tab" type="button" aria-selected={l === locale} onClick={() => setLocale(l)}
            className={cn("min-h-10 rounded-full px-5 text-sm font-semibold uppercase", l === locale && "bg-navy text-cloud dark:bg-cloud dark:text-navy")}>
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {contentKeys.map((key: ContentKey) => {
          const id = `${locale}:${key}`;
          return (
            <GlassCard key={id} className="p-0 md:p-0">
              <details className="group">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-semibold md:px-6">
                  {humanize(key)}
                  <span className="text-xs text-muted group-open:hidden">{t("open")}</span>
                </summary>
                <div className="space-y-5 border-t border-navy/10 p-5 md:p-6">
                  <ZodForm schema={ContentSchemas[key]} value={data[locale][key]} onChange={(v) => setKey(locale, key, v)} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="md" disabled={busy === id} onClick={() => run(id, async () => {
                      const r = await saveContentAction(locale, key, data[locale][key]);
                      toast(r.ok ? "ok" : "error", r.ok ? t("saved") : r.error);
                    })}><Save className="size-4" aria-hidden />{t("save")}</Button>
                    <SmallBtn className="min-h-11 px-4" disabled={busy === id} onClick={() => {
                      if (!window.confirm(t("resetConfirm"))) return;
                      run(id, async () => {
                        const r = await resetContentAction(locale, key);
                        if (r.ok) { setKey(locale, key, r.data); toast("ok", t("resetDone")); } else toast("error", r.error);
                      });
                    }}><RotateCcw className="size-4" aria-hidden />{t("reset")}</SmallBtn>
                    {locale !== "ro" && (
                      <SmallBtn className="min-h-11 px-4" disabled={busy === id} onClick={() => run(id, async () => {
                        const r = await translateContentAction(key, locale, data.ro[key]);
                        if (r.ok) { setKey(locale, key, r.data); toast("ok", t("translated")); } else toast("error", errText(r.error));
                      })}><Languages className="size-4" aria-hidden />{busy === id ? t("translating") : t("translate")}</SmallBtn>
                    )}
                  </div>
                </div>
              </details>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
