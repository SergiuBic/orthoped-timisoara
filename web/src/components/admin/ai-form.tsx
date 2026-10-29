"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Save, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import type { AiSettings } from "@/lib/content/types";
import { saveAiAction } from "@/app/admin/(panel)/ai/actions";
import { Field, Fieldset, SmallBtn, Switch, TextArea, TextField, inputCls } from "./fields";
import { useToast } from "./toast";

const LOCALES = ["ro", "en", "it"] as const;
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

export function AiForm({ initial }: { initial: AiSettings }) {
  const t = useTranslations("Admin.ai");
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const set = <K extends keyof AiSettings>(k: K, v: AiSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const custom = !MODELS.includes(s.model);

  return (
    <form onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveAiAction(s); toast(r.ok ? "ok" : "error", r.ok ? t("saved") : r.error); }); }} className="space-y-4">
      <GlassCard className="space-y-4 p-5 md:p-6">
        <Switch label={t("enabled")} checked={s.enabled} onChange={(v) => set("enabled", v)} />
        <TextField label={t("assistantName")} value={s.assistantName} onChange={(v) => set("assistantName", v)} />
        <TextArea label={t("persona")} hint={t("personaHint")} rows={9} value={s.persona} onChange={(v) => set("persona", v)} />
        <Fieldset legend={t("rules")}>
          {s.rules.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label={`${t("rules")} ${i + 1}`} className={inputCls} value={r} onChange={(e) => set("rules", s.rules.map((x, j) => (j === i ? e.target.value : x)))} />
              <SmallBtn className="min-h-11" aria-label={t("remove")} onClick={() => set("rules", s.rules.filter((_, j) => j !== i))}><Trash2 className="size-4" /></SmallBtn>
            </div>
          ))}
          <SmallBtn onClick={() => set("rules", [...s.rules, ""])}><Plus className="size-4" />{t("addRule")}</SmallBtn>
        </Fieldset>
      </GlassCard>

      <GlassCard className="space-y-4 p-5 md:p-6">
        {LOCALES.map((l) => (
          <Fieldset key={l} legend={l.toUpperCase()}>
            <TextArea label={t("greeting")} rows={2} value={s.greeting[l]} onChange={(v) => set("greeting", { ...s.greeting, [l]: v })} />
            <TextArea label={t("suggestions")} hint={t("suggestionsHint")} rows={4} value={s.suggestions[l].join("\n")}
              onChange={(v) => set("suggestions", { ...s.suggestions, [l]: v.split("\n").slice(0, 4) })} />
          </Fieldset>
        ))}
      </GlassCard>

      <GlassCard className="space-y-4 p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("model")}>
            {(id) => (
              <select id={id} className={inputCls} value={custom ? "__custom" : s.model} onChange={(e) => set("model", e.target.value === "__custom" ? "gemini-" : e.target.value)}>
                {MODELS.map((m) => <option key={m}>{m}</option>)}
                <option value="__custom">{t("customModel")}</option>
              </select>
            )}
          </Field>
          {custom && <TextField label={t("modelId")} value={s.model} onChange={(v) => set("model", v)} />}
          <Field label={`${t("temperature")}: ${s.temperature.toFixed(2)}`}>
            {(id) => <input id={id} type="range" min={0} max={1} step={0.05} value={s.temperature} onChange={(e) => set("temperature", Number(e.target.value))} className="min-h-11 w-full accent-[#e8916a]" />}
          </Field>
          <TextField label={t("maxMessages")} type="number" min={4} max={100} value={s.maxMessagesPerSession} onChange={(v) => set("maxMessagesPerSession", Number(v))} />
          <TextField label={t("dailyLimit")} type="number" min={10} value={s.dailyGlobalLimit} onChange={(v) => set("dailyGlobalLimit", Number(v))} />
        </div>
      </GlassCard>
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}><Save className="size-5" aria-hidden />{pending ? "…" : t("save")}</Button>
      </div>
    </form>
  );
}
