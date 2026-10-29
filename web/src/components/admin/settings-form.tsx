"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Save, LocateFixed } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { resolveTokens } from "@/lib/content/tokens";
import type { SiteSettings } from "@/lib/content/types";
import { saveSettingsAction, geocodeAction } from "@/app/admin/(panel)/settings/actions";
import { Fieldset, SelectField, SmallBtn, TextField } from "./fields";
import { useToast } from "./toast";

type Seo = { titleTemplate: string; description: string };
const LOCALES = ["ro", "en", "it"] as const;
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export function SettingsForm({ initial, seo }: { initial: SiteSettings; seo: Record<string, Seo> }) {
  const t = useTranslations("Admin.settings");
  const toast = useToast();
  const [s, setS] = useState<SiteSettings>(initial);
  const [pending, start] = useTransition();
  const [geo, startGeo] = useTransition();
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const setAddr = (patch: Partial<SiteSettings["address"]>) => setS((x) => ({ ...x, address: { ...x.address, ...patch } }));

  const save = () =>
    start(async () => {
      const r = await saveSettingsAction(s);
      if (r.ok) toast("ok", t("saved"));
      else toast("error", r.error);
    });

  const findCoords = () =>
    startGeo(async () => {
      const a = s.address;
      const q = [a.street, a.postalCode, a.city.ro, a.region, a.countryCode].filter(Boolean).join(", ");
      const r = await geocodeAction(q);
      if (r.ok) { setAddr({ lat: r.data.lat, lng: r.data.lng }); toast("ok", t("geoOk")); }
      else toast("error", t("geoFail"));
    });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4 pb-4">
      <GlassCard className="space-y-4 p-5 md:p-6">
        <h2 className="font-semibold">{t("doctor")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label={t("doctorName")} value={s.doctorName} onChange={(v) => set("doctorName", v)} />
          <TextField label={t("doctorTitles")} value={s.doctorTitles} onChange={(v) => set("doctorTitles", v)} />
          <TextField label={t("clinicName")} value={s.clinicName} onChange={(v) => set("clinicName", v)} />
          <TextField label={t("phone")} hint="+40…" value={s.phone} onChange={(v) => set("phone", v)} />
          <TextField label={t("phoneDisplay")} value={s.phoneDisplay} onChange={(v) => set("phoneDisplay", v)} />
          <TextField label={t("whatsapp")} hint={t("emptyHides")} value={s.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <TextField label={t("email")} type="email" hint={t("emptyHides")} value={s.email} onChange={(v) => set("email", v)} />
          <TextField label={t("siteUrl")} type="url" value={s.siteUrl} onChange={(v) => set("siteUrl", v)} className="sm:col-span-2" />
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-5 md:p-6">
        <h2 className="font-semibold">{t("address")}</h2>
        <Fieldset legend={t("city")}>
          <p className="rounded-xl bg-peach/30 p-3 text-sm">{t("cityNote")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {LOCALES.map((l) => (
              <TextField key={l} label={l.toUpperCase()} value={s.address.city[l]} onChange={(v) => setAddr({ city: { ...s.address.city, [l]: v } })} />
            ))}
          </div>
        </Fieldset>
        <div className="grid gap-4 sm:grid-cols-4">
          <TextField label={t("street")} value={s.address.street} onChange={(v) => setAddr({ street: v })} className="sm:col-span-2" />
          <TextField label={t("region")} value={s.address.region} onChange={(v) => setAddr({ region: v })} />
          <TextField label={t("postalCode")} value={s.address.postalCode} onChange={(v) => setAddr({ postalCode: v })} />
          <TextField label={t("country")} maxLength={2} value={s.address.countryCode} onChange={(v) => setAddr({ countryCode: v.toUpperCase() })} />
          <TextField label={t("lat")} type="number" step="any" value={s.address.lat} onChange={(v) => setAddr({ lat: Number(v) })} />
          <TextField label={t("lng")} type="number" step="any" value={s.address.lng} onChange={(v) => setAddr({ lng: Number(v) })} />
          <div className="flex items-end">
            <SmallBtn onClick={findCoords} disabled={geo} className="min-h-11 w-full"><LocateFixed className="size-4" aria-hidden />{geo ? "…" : t("findCoords")}</SmallBtn>
          </div>
          <TextField label={t("mapsUrl")} type="url" value={s.address.mapsUrl} onChange={(v) => setAddr({ mapsUrl: v })} className="sm:col-span-4" />
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-5 md:p-6">
        <h2 className="font-semibold">{t("hours")}</h2>
        {s.hours.map((h, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <SelectField label={t("day")} value={h.day} onChange={(v) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, day: v as (typeof DAYS)[number] } : x)))} options={DAYS.map((d) => ({ value: d, label: t(`days.${d}`) }))} className="w-32" />
            <TextField label={t("opens")} type="time" value={h.opens} onChange={(v) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, opens: v } : x)))} className="w-32" />
            <TextField label={t("closes")} type="time" value={h.closes} onChange={(v) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, closes: v } : x)))} className="w-32" />
            <SmallBtn aria-label={t("remove")} className="min-h-11" onClick={() => set("hours", s.hours.filter((_, j) => j !== i))}><Trash2 className="size-4" aria-hidden /></SmallBtn>
          </div>
        ))}
        <SmallBtn onClick={() => set("hours", [...s.hours, { day: "Mo", opens: "09:00", closes: "17:00" }])}><Plus className="size-4" aria-hidden />{t("addRow")}</SmallBtn>
      </GlassCard>

      <GlassCard className="space-y-4 p-5 md:p-6">
        <h2 className="font-semibold">{t("social")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["linkedin", "researchgate", "facebook", "instagram"] as const).map((k) => (
            <TextField key={k} label={k} type="url" value={s.social[k] ?? ""} onChange={(v) => set("social", { ...s.social, [k]: v })} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-5 md:p-6">
        <h2 className="font-semibold">{t("preview")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {LOCALES.map((l) => {
            const ctx = { city: s.address.city[l], doctor: s.doctorName, phone: s.phoneDisplay };
            const sc = seo[l];
            return (
              <div key={l} className="rounded-2xl bg-white p-4 text-left text-[#202124] shadow-sm">
                <div className="truncate text-xs text-[#4d5156]">{s.siteUrl.replace(/\/$/, "")}/{l}</div>
                <div className="mt-0.5 line-clamp-2 text-lg leading-snug text-[#1a0dab]">{resolveTokens(sc?.titleTemplate ?? "", ctx)}</div>
                <div className="mt-1 line-clamp-3 text-sm text-[#4d5156]">{resolveTokens(sc?.description ?? "", ctx)}</div>
                <div className="mt-2 text-[10px] font-bold text-[#4d5156] uppercase">{l}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="sticky bottom-20 z-10 flex justify-end md:bottom-4">
        <Button type="submit" size="lg" disabled={pending}><Save className="size-5" aria-hidden />{pending ? "…" : t("save")}</Button>
      </div>
    </form>
  );
}
