"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { track } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  assistantName: string;
  greeting: string;
  suggestions: string[];
  phone: string;
  phoneDisplay: string;
};

type ChatMessage = UIMessage<{ sessionId?: string }>;

const KEY = "ortoped-chat-session";
const MAX = 1000;
const mdClass = "[&>div]:space-y-2 [&>div]:text-[0.95rem] [&>div]:leading-relaxed";

const session: { id: string | null } = { id: null };

function readSession(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function writeSession(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {}
}

export default function ChatPanel({
  open,
  onClose,
  locale,
  assistantName,
  greeting,
  suggestions,
  phone,
  phoneDisplay,
}: ChatPanelProps) {
  const t = useTranslations("Chat");
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    session.id ??= readSession();
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, sessionId: session.id, locale },
        }),
      }),
    [locale],
  );
  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";

  // Keep the session id returned by the server (message metadata).
  useEffect(() => {
    for (const m of messages) {
      const id = m.metadata?.sessionId;
      if (id && id !== session.id) {
        session.id = id;
        writeSession(id);
      }
    }
  }, [messages]);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status, error]);

  // Focus management + mobile keyboard (visualViewport) sizing.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => input.current?.focus(), 50);
    const vv = window.visualViewport;
    const apply = () => {
      if (!root.current || !vv) return;
      root.current.style.setProperty("--chat-h", `${Math.round(vv.height)}px`);
      root.current.style.setProperty("--chat-top", `${Math.round(vv.offsetTop)}px`);
    };
    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    const prev = document.body.style.overflow;
    if (window.matchMedia("(max-width: 767px)").matches) document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(id);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !root.current) return;
    const f = [...root.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),textarea:not([disabled])")].filter(
      (el) => el.offsetParent !== null,
    );
    if (!f.length) return;
    const first = f[0];
    const lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      first.focus();
    }
  }

  function send(value: string) {
    const v = value.trim();
    if (!v || busy) return;
    void sendMessage({ text: v.slice(0, MAX) });
    setText("");
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
  }
  function onInputKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(text);
    }
  }

  const lastMsg = messages[messages.length - 1];
  const lastHasText = lastMsg?.role === "assistant" && lastMsg.parts.some((p) => p.type === "text" && p.text);
  const typing = status === "submitted" || (status === "streaming" && !lastHasText);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={assistantName}
      inert={!open}
      onKeyDown={onKeyDown}
      className={cn(
        "glass fixed z-50 flex flex-col overflow-hidden bg-bg/80",
        "inset-x-0 top-[var(--chat-top,0px)] h-[var(--chat-h,100dvh)] rounded-none",
        "md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:h-[600px] md:max-h-[calc(100dvh-3rem)] md:w-[400px] md:rounded-3xl",
        open ? "animate-[chat-in_0.28s_cubic-bezier(0.22,1,0.36,1)]" : "hidden",
      )}
    >
      <style>{`@keyframes chat-in{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}`}</style>

      <header
        className="flex items-center gap-3 border-b border-fg/10 px-4 pb-3"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-peach text-navy">
          <Icon name="Sparkles" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold leading-tight">{assistantName}</p>
          <p className="truncate text-xs text-muted">{t("dialog")}</p>
        </div>
        <Button
          href={`tel:${phone}`}
          size="md"
          className="min-h-10 px-4 text-sm"
          onClick={() => track("click_phone", "chat")}
        >
          <Icon name="Phone" className="size-4" />
          <span>{t("call")}</span>
        </Button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-fg/10 focus-visible:outline-2 focus-visible:outline-navy dark:focus-visible:outline-peach"
        >
          <Icon name="X" className="size-5" />
        </button>
      </header>

      <div
        ref={list}
        role="log"
        aria-live="polite"
        aria-label={t("messages")}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <Bubble role="assistant">
          <Markdown source={greeting} className={mdClass} />
        </Bubble>

        {messages.map((m) => (
          <MessageView key={m.id} m={m} t={t} />
        ))}

        {typing && (
          <Bubble role="assistant">
            <span className="flex items-center gap-1 py-1" role="status" aria-label={t("thinking")}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
          </Bubble>
        )}

        {error && (
          <Bubble role="assistant" tone="error">
            <p className="text-sm">{t("error", { phone: phoneDisplay })}</p>
          </Bubble>
        )}

        {messages.length === 0 && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label={t("suggestionsLabel")}>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="glass min-h-10 rounded-full px-4 py-2 text-left text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-navy dark:focus-visible:outline-peach"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-fg/10 px-3 pt-3" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            {t("placeholder")}
          </label>
          <textarea
            id="chat-input"
            ref={input}
            rows={1}
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t("placeholder")}
            enterKeyHint="send"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-fg/15 bg-white/60 px-4 py-2.5 text-base text-fg placeholder:text-muted focus-visible:outline-2 focus-visible:outline-navy dark:bg-white/10 dark:focus-visible:outline-peach"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          {busy ? (
            <Button variant="secondary" onClick={() => void stop()} aria-label={t("stop")} className="size-11 shrink-0 px-0">
              <Icon name="X" className="size-5" />
            </Button>
          ) : (
            <Button type="submit" disabled={!text.trim()} aria-label={t("send")} className="size-11 shrink-0 px-0">
              <Icon name="ArrowRight" className="size-5" />
            </Button>
          )}
        </form>
        <p className="px-1 pt-2 text-center text-[11px] leading-snug text-muted">{t("disclaimer")}</p>
      </div>
    </div>
  );
}

function Bubble({
  role,
  tone,
  children,
}: {
  role: "user" | "assistant";
  tone?: "error";
  children: React.ReactNode;
}) {
  const user = role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-2.5 break-words",
          user
            ? "rounded-br-md bg-navy text-cloud dark:bg-peach dark:text-navy"
            : "glass rounded-bl-md",
          tone === "error" && "border-danger/50",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function MessageView({ m, t }: { m: ChatMessage; t: ReturnType<typeof useTranslations> }) {
  if (m.role === "user") {
    const txt = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return (
      <Bubble role="user">
        <p className="whitespace-pre-wrap text-[0.95rem]">{txt}</p>
      </Bubble>
    );
  }
  return (
    <>
      {m.parts.map((p, i) => {
        if (p.type === "text") {
          return p.text ? (
            <Bubble key={i} role="assistant">
              <Markdown source={p.text} className={mdClass} />
            </Bubble>
          ) : null;
        }
        if (p.type === "tool-requestCallback" && p.state === "output-available") {
          const ok = (p.output as { ok?: boolean } | undefined)?.ok === true;
          return (
            <div
              key={i}
              className={cn(
                "glass flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium",
                ok ? "text-ok" : "text-danger",
              )}
            >
              <Icon name={ok ? "CalendarCheck" : "X"} className="size-5 shrink-0" />
              {ok ? t("callbackOk") : t("callbackFail")}
            </div>
          );
        }
        if (p.type === "tool-searchKnowledge" && p.state !== "output-available" && p.state !== "output-error") {
          return (
            <p key={i} className="px-2 text-xs text-muted">
              {t("searching")}
            </p>
          );
        }
        return null;
      })}
    </>
  );
}
