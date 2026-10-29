"use client";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Toast = { id: number; kind: "ok" | "error"; text: string };
const Ctx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const n = useRef(0);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++n.current;
    setItems((x) => [...x, { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="glass pointer-events-auto flex max-w-md items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg"
          >
            {t.kind === "ok" ? <CheckCircle2 className="size-4 shrink-0 text-ok" /> : <XCircle className="size-4 shrink-0 text-danger" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
