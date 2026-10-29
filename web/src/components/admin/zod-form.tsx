"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Generates a form from a zod v4 schema: string / string[] / object / object[] / enum / number / boolean.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { Fieldset, Field, SmallBtn, Switch, TextArea, TextField, SelectField, inputCls } from "./fields";

type Z = any;

const LONG_NAMES = new Set(["body", "text", "answer", "a", "intro", "privacyBody", "medicalDisclaimer", "subtitle", "description", "emergencyNote"]);
const MD_NAMES = new Set(["body", "privacyBody"]);

export const humanize = (k: string) => {
  const s = k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function unwrap(s: Z): { inner: Z; description?: string } {
  let cur = s;
  let description: string | undefined = s.description;
  while (["optional", "nullable", "default", "readonly"].includes(cur.def.type)) {
    cur = cur.def.innerType;
    description ??= cur.description;
  }
  description ??= cur.description;
  return { inner: cur, description };
}

export function defaultFor(s: Z): unknown {
  const { inner } = unwrap(s);
  switch (inner.def.type) {
    case "string": return "";
    case "number": return 0;
    case "boolean": return false;
    case "enum": return inner.options[0];
    case "array": return [];
    case "object": return Object.fromEntries(Object.entries<Z>(inner.shape).map(([k, v]) => [k, defaultFor(v)]));
    default: return null;
  }
}

type P = { schema: Z; value: unknown; onChange: (v: unknown) => void; name: string };

export function ZodForm({ schema, value, onChange }: { schema: Z; value: unknown; onChange: (v: unknown) => void }) {
  return <NodeField schema={schema} value={value} onChange={onChange} name="" />;
}

function NodeField({ schema, value, onChange, name }: P) {
  const t = useTranslations("Admin.content");
  const { inner, description } = unwrap(schema);
  const short = description && description.length <= 36 ? description : undefined;
  const label = short ?? humanize(name || "value");
  const hint = !short ? description : undefined;
  const type = inner.def.type as string;

  if (type === "object") {
    const shape = inner.shape as Record<string, Z>;
    const body = (
      <div className="space-y-4">
        {Object.entries(shape).map(([k, child]) => (
          <NodeField
            key={k}
            name={k}
            schema={child}
            value={(value as Record<string, unknown> | undefined)?.[k]}
            onChange={(v) => onChange({ ...(value as object), [k]: v })}
          />
        ))}
      </div>
    );
    return name ? <Fieldset legend={label}>{hint && <p className="text-xs text-muted">{hint}</p>}{body}</Fieldset> : body;
  }

  if (type === "string") {
    const v = (value as string | undefined) ?? "";
    const max: number | null = inner.maxLength ?? null;
    const long = LONG_NAMES.has(name) || (max !== null && max > 200);
    const tokenHint = <>{hint ? `${hint} · ` : ""}{t("tokens")}{max ? ` · ${v.length}/${max}` : ""}</>;
    if (long) {
      return (
        <div className="space-y-2">
          <TextArea label={label} value={v} onChange={onChange} rows={MD_NAMES.has(name) ? 10 : 4} hint={tokenHint} />
          {MD_NAMES.has(name) && v.trim() && (
            <div className="rounded-2xl border border-dashed border-navy/20 p-4">
              <div className="mb-2 text-xs font-semibold text-muted uppercase">{t("preview")}</div>
              <Markdown source={v} />
            </div>
          )}
        </div>
      );
    }
    return <TextField label={label} value={v} onChange={onChange} hint={tokenHint} />;
  }

  if (type === "enum") {
    return (
      <SelectField label={label} hint={hint} value={String(value ?? inner.options[0])} onChange={onChange}
        options={(inner.options as string[]).map((o) => ({ value: o, label: o }))} />
    );
  }
  if (type === "number") {
    return <TextField label={label} hint={hint} type="number" value={Number(value ?? 0)} onChange={(v) => onChange(Number(v))} />;
  }
  if (type === "boolean") return <Switch label={label} checked={Boolean(value)} onChange={onChange} />;

  if (type === "array") {
    const el = unwrap(inner.element).inner;
    const items = (Array.isArray(value) ? value : []) as unknown[];
    if (el.def.type === "string" || el.def.type === "enum") {
      return <TagList label={label} hint={hint} items={items as string[]} onChange={onChange} />;
    }
    const move = (i: number, d: number) => {
      const next = [...items];
      const j = i + d;
      if (j < 0 || j >= next.length) return;
      [next[i], next[j]] = [next[j], next[i]];
      onChange(next);
    };
    return (
      <Fieldset legend={`${label} (${items.length})`}>
        {hint && <p className="text-xs text-muted">{hint}</p>}
        {items.map((item, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-white/50 p-4 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">#{i + 1}</span>
              <div className="flex gap-1">
                <SmallBtn aria-label={t("up")} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></SmallBtn>
                <SmallBtn aria-label={t("down")} disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></SmallBtn>
                <SmallBtn aria-label={t("remove")} onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="size-4" /></SmallBtn>
              </div>
            </div>
            <NodeField name="" schema={inner.element} value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          </div>
        ))}
        <SmallBtn onClick={() => onChange([...items, defaultFor(inner.element)])}><Plus className="size-4" />{t("add")}</SmallBtn>
      </Fieldset>
    );
  }
  return null;
}

function TagList({ label, hint, items, onChange }: { label: string; hint?: string; items: string[]; onChange: (v: unknown) => void }) {
  const t = useTranslations("Admin.content");
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v) onChange([...items, v]);
    setDraft("");
  };
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-2">
            {items.map((x, i) => (
              <li key={i} className="glass inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm">
                {x}
                <button type="button" aria-label={t("remove")} className="grid size-7 place-items-center rounded-full hover:bg-navy/10" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input id={id} className={inputCls} value={draft} placeholder={t("addPlaceholder")} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
            <SmallBtn className="min-h-11" onClick={add}><Plus className="size-4" />{t("add")}</SmallBtn>
          </div>
        </div>
      )}
    </Field>
  );
}
