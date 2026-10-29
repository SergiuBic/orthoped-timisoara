"use client";
import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Markdown } from "@/components/ui/markdown";
import { Button } from "@/components/ui/button";
import { inputCls } from "./fields";

export function Playground() {
  const t = useTranslations("Admin.ai");
  const [locale, setLocale] = useState("ro");
  const [text, setText] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        headers: { "x-admin-preview": "1" },
        prepareSendMessagesRequest: ({ messages }) => ({ body: { messages, locale } }),
      }),
    [locale],
  );
  const { messages, sendMessage, status, error, setMessages } = useChat<UIMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";
  return (
    <GlassCard className="flex h-[36rem] flex-col p-4 md:p-5 xl:sticky xl:top-4 xl:h-[calc(100dvh-2rem)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">{t("playground")}</h2>
          <p className="text-xs text-muted">{t("playgroundHint")}</p>
        </div>
        <select aria-label={t("language")} className={`${inputCls} w-20`} value={locale} onChange={(e) => { setLocale(e.target.value); setMessages([]); }}>
          {["ro", "en", "it"].map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/40 p-3 dark:bg-white/5" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-8 rounded-2xl bg-peach p-3 text-navy" : "mr-8 rounded-2xl bg-white/80 p-3 text-navy"}>
            {m.parts.map((p, i) => (p.type === "text" ? <Markdown key={i} source={p.text} /> : null))}
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-danger">{t("chatError")}</p>}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = text.trim(); if (!v || busy) return; setText(""); void sendMessage({ text: v }); }}>
        <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("chatPlaceholder")} aria-label={t("chatPlaceholder")} />
        <Button type="submit" disabled={busy} aria-label={t("send")}><Send className="size-4" aria-hidden /></Button>
      </form>
    </GlassCard>
  );
}
