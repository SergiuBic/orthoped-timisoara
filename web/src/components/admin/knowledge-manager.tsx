"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, RotateCw, Search, Trash2, UploadCloud } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import {
  deleteFileAction, reindexSiteAction, reprocessFileAction, testSearchAction, type SearchHit,
} from "@/app/admin/(panel)/knowledge/actions";
import { SelectField, SmallBtn, inputCls } from "./fields";
import { useToast } from "./toast";

type FileRow = { id: string; filename: string; size: number; status: "pending" | "processing" | "ready" | "error"; error: string | null; chunkCount: number; createdAt: string };
const EXT = [".pdf", ".docx", ".xlsx", ".csv", ".txt", ".md"];
const BADGE: Record<FileRow["status"], string> = {
  pending: "bg-navy/10", processing: "bg-peach", ready: "bg-ok/20 text-ok", error: "bg-danger/15 text-danger",
};
const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function KnowledgeManager({ initial }: { initial: FileRow[] }) {
  const t = useTranslations("Admin.knowledge");
  const toast = useToast();
  const [files, setFiles] = useState(initial);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [, start] = useTransition();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("ro");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/admin/knowledge/list", { cache: "no-store" }).catch(() => null);
    if (r?.ok) setFiles(await r.json());
  }, []);

  const active = files.some((f) => f.status === "pending" || f.status === "processing");
  useEffect(() => {
    if (!active) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [active, refresh]);

  async function upload(list: FileList | File[]) {
    setUploading(true);
    for (const f of Array.from(list)) {
      if (!EXT.some((e) => f.name.toLowerCase().endsWith(e))) { toast("error", `${f.name}: ${t("badType")}`); continue; }
      if (f.size > 20 * 1024 * 1024) { toast("error", `${f.name}: ${t("tooLarge")}`); continue; }
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch("/api/admin/knowledge", { method: "POST", body: fd }).catch(() => null);
      if (res?.ok) toast("ok", `${f.name}: ${t("uploaded")}`);
      else toast("error", `${f.name}: ${t("failed")}`);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    await refresh();
  }

  const act = (fn: () => Promise<{ ok: boolean }>, msg?: string) =>
    start(async () => { const r = await fn(); toast(r.ok ? "ok" : "error", r.ok ? (msg ?? t("done")) : t("failed")); await refresh(); });

  return (
    <div className="space-y-4">
      <GlassCard
        className={cn("border-2 border-dashed p-8 text-center md:p-10", drag && "bg-peach/40")}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void upload(e.dataTransfer.files); }}
      >
        <input ref={input} type="file" multiple hidden accept={EXT.join(",")} onChange={(e) => e.target.files && upload(e.target.files)} />
        <UploadCloud className="mx-auto size-8 text-peach-deep" aria-hidden />
        <p className="mt-2 font-semibold">{t("drop")}</p>
        <p className="text-xs text-muted">{t("limits")}</p>
        <SmallBtn className="mt-3 min-h-11 px-5" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? "…" : t("choose")}</SmallBtn>
      </GlassCard>

      <GlassCard className="overflow-x-auto p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t("files")}</h2>
          <SmallBtn className="min-h-10 px-4" onClick={() => act(async () => { const r = await reindexSiteAction(); return r; }, t("reindexed"))}>
            <RefreshCw className="size-4" aria-hidden />{t("reindex")}
          </SmallBtn>
        </div>
        {files.length === 0 ? <p className="text-sm text-muted">{t("empty")}</p> : (
          <table className="w-full min-w-[34rem] text-sm">
            <thead><tr className="text-left text-xs text-muted uppercase">
              <th className="py-2">{t("name")}</th><th>{t("size")}</th><th>{t("status")}</th><th>{t("chunks")}</th><th>{t("date")}</th><th />
            </tr></thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} className="border-t border-navy/5 align-top">
                  <td className="max-w-56 truncate py-2 pr-2" title={f.filename}>{f.filename}</td>
                  <td className="whitespace-nowrap">{fmtSize(f.size)}</td>
                  <td>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", BADGE[f.status])}>{t(`st.${f.status}`)}</span>
                    {f.error && <div className="mt-1 max-w-48 text-xs text-danger">{f.error}</div>}
                  </td>
                  <td>{f.chunkCount}</td>
                  <td className="whitespace-nowrap">{f.createdAt.slice(0, 10)}</td>
                  <td className="space-x-1 text-right whitespace-nowrap">
                    <SmallBtn aria-label={t("reprocess")} title={t("reprocess")} onClick={() => act(() => reprocessFileAction(f.id))}><RotateCw className="size-4" /></SmallBtn>
                    <SmallBtn aria-label={t("delete")} title={t("delete")} onClick={() => { if (window.confirm(t("deleteConfirm"))) act(() => deleteFileAction(f.id)); }}><Trash2 className="size-4" /></SmallBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <GlassCard className="space-y-3 p-4 md:p-5">
        <h2 className="font-semibold">{t("testSearch")}</h2>
        <form className="flex flex-wrap items-end gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!q.trim()) return;
          setSearching(true);
          const r = await testSearchAction(q, loc);
          setSearching(false);
          if (r.ok) setHits(r.data); else { setHits(null); toast("error", t("searchFailed")); }
        }}>
          <input className={cn(inputCls, "flex-1")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("testSearch")} />
          <SelectField label="" value={loc} onChange={setLoc} options={["ro", "en", "it"].map((l) => ({ value: l, label: l.toUpperCase() }))} className="w-24 [&>label]:sr-only" />
          <SmallBtn type="submit" className="min-h-11 px-5" disabled={searching}><Search className="size-4" aria-hidden />{searching ? "…" : t("search")}</SmallBtn>
        </form>
        {hits && (hits.length === 0 ? <p className="text-sm text-muted">{t("noHits")}</p> : (
          <ol className="space-y-2">
            {hits.map((h, i) => (
              <li key={h.id} className="rounded-2xl bg-white/50 p-3 text-sm dark:bg-white/5">
                <div className="mb-1 flex flex-wrap gap-2 text-xs text-muted">
                  <span>#{i + 1}</span><span>{t("score")}: {h.score.toFixed(3)}</span><span>{h.source}{h.file ? ` · ${h.file}` : ""}</span>
                </div>
                <p className="whitespace-pre-wrap">{h.content.slice(0, 600)}</p>
              </li>
            ))}
          </ol>
        ))}
      </GlassCard>
    </div>
  );
}
