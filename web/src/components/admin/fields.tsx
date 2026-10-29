"use client";
import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full min-h-11 rounded-2xl border border-navy/15 bg-white/70 px-3.5 py-2 text-base text-navy placeholder:text-navy/40 " +
  "outline-2 outline-offset-2 outline-transparent focus-visible:outline-navy dark:border-white/15 dark:bg-white/10 dark:text-cloud dark:focus-visible:outline-peach";

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      {children(id)}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "onChange" | "value"> & { value: string | number; onChange: (v: string) => void; label: string; hint?: ReactNode };
export function TextField({ label, hint, onChange, className, ...p }: InputProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <input id={id} className={inputCls} onChange={(e) => onChange(e.target.value)} {...p} />}
    </Field>
  );
}

type AreaProps = Omit<ComponentPropsWithoutRef<"textarea">, "onChange" | "value"> & { value: string; onChange: (v: string) => void; label: string; hint?: ReactNode };
export function TextArea({ label, hint, onChange, className, rows = 4, ...p }: AreaProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <textarea id={id} rows={rows} className={cn(inputCls, "resize-y leading-relaxed")} onChange={(e) => onChange(e.target.value)} {...p} />}
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, hint, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: ReactNode; className?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors outline-2 outline-offset-2 outline-transparent focus-visible:outline-navy dark:focus-visible:outline-peach", checked ? "bg-peach-deep" : "bg-navy/25")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </button>
      {label}
    </label>
  );
}

export function Fieldset({ legend, children, className }: { legend: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn("space-y-4 rounded-2xl border border-navy/10 p-4 dark:border-white/10", className)}>
      <legend className="px-2 text-sm font-semibold text-muted">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function SmallBtn({ className, ...p }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn("inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-navy/15 px-3 text-sm font-medium hover:bg-white/60 disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/10", className)}
      {...p}
    />
  );
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}
