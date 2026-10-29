"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, Trash2, Upload } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { setAltAction, setDoctorPhotoAction, deleteMediaAction } from "@/app/admin/(panel)/media/actions";
import { SmallBtn, TextField } from "./fields";
import { useToast } from "./toast";

type Item = { id: string; filename: string; width: number | null; height: number | null; alt: Record<string, string> };

export function MediaManager({ items, doctorPhotoId }: { items: Item[]; doctorPhotoId: string | null }) {
  const t = useTranslations("Admin.media");
  const toast = useToast();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [alts, setAlts] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(items.map((i) => [i.id, i.alt])));
  const [, start] = useTransition();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd }).catch(() => null);
      const j = res ? ((await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null) : null;
      if (j?.ok) toast("ok", `${f.name}: ${t("uploaded")}`);
      else toast("error", `${f.name}: ${j?.error === "too_large" ? t("tooLarge") : j?.error === "bad_type" ? t("badType") : t("failed")}`);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }
  const act = (fn: () => Promise<{ ok: boolean }>, msg?: string) =>
    start(async () => { const r = await fn(); if (r.ok) { if (msg) toast("ok", msg); router.refresh(); } else toast("error", t("failed")); });

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
        <SmallBtn className="min-h-11 px-5" disabled={uploading} onClick={() => input.current?.click()}>
          <Upload className="size-4" aria-hidden />{uploading ? "…" : t("upload")}
        </SmallBtn>
        <p className="mt-2 text-xs text-muted">{t("limits")}</p>
      </GlassCard>
      {items.length === 0 && <p className="text-muted">{t("empty")}</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <li key={m.id}>
            <GlassCard className="space-y-3 p-4 md:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${m.id}`} alt={alts[m.id]?.en ?? ""} className="aspect-4/3 w-full rounded-2xl object-cover" loading="lazy" />
              <div className="text-xs text-muted">{m.filename} · {m.width}×{m.height}</div>
              {(["ro", "en", "it"] as const).map((l) => (
                <TextField key={l} label={`${t("alt")} ${l.toUpperCase()}`} value={alts[m.id]?.[l] ?? ""}
                  onChange={(v) => setAlts((a) => ({ ...a, [m.id]: { ...a[m.id], [l]: v } }))}
                  onBlur={() => act(() => setAltAction(m.id, alts[m.id] ?? {}))} />
              ))}
              <div className="flex flex-wrap gap-2">
                <SmallBtn disabled={doctorPhotoId === m.id} onClick={() => act(() => setDoctorPhotoAction(m.id), t("photoSet"))}>
                  <Star className="size-4" aria-hidden />{doctorPhotoId === m.id ? t("isPhoto") : t("usePhoto")}
                </SmallBtn>
                <SmallBtn aria-label={t("delete")} onClick={() => { if (window.confirm(t("deleteConfirm"))) act(() => deleteMediaAction(m.id)); }}>
                  <Trash2 className="size-4" aria-hidden />
                </SmallBtn>
              </div>
            </GlassCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
