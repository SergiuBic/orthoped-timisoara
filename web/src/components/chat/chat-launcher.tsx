"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics/client";
import type { ChatPanelProps } from "./chat-panel";

// The panel (and with it the AI SDK) is only fetched on first interaction.
const loadPanel = () => import("./chat-panel");
const ChatPanel = dynamic(loadPanel, { ssr: false });

export type ChatLauncherProps = Omit<ChatPanelProps, "open" | "onClose">;

export function ChatLauncherClient(props: ChatLauncherProps) {
  const t = useTranslations("Chat");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setPulse(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const show = () => {
    setMounted(true);
    setOpen(true);
    setPulse(false);
    track("chat_open", "chat");
  };
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => btn.current?.focus());
  }, []);

  return (
    <>
      {!open && (
      <button
        ref={btn}
        type="button"
        onClick={show}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        aria-label={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-peach text-navy shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_28px_-6px_var(--peach-deep)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy dark:focus-visible:outline-peach bottom-[calc(72px+env(safe-area-inset-bottom))] md:right-6 md:bottom-6"
      >
        {pulse && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-peach animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_2] motion-reduce:hidden"
            onAnimationEnd={() => setPulse(false)}
          />
        )}
        <Icon name="MessageCircle" className="relative size-6" />
      </button>
      )}
      {mounted && <ChatPanel {...props} open={open} onClose={close} />}
    </>
  );
}
