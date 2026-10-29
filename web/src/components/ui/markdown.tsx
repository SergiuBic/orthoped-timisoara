import type { ReactNode } from "react";

/** Minimal safe markdown: ##/### headings, paragraphs, lists, **bold**, *italic*, [links](url). */

function safeHref(url: string): string | null {
  const u = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u)) return u;
  return null;
}

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={key}>{m[2]}</em>);
    else {
      const href = safeHref(m[4]);
      out.push(
        href ? (
          <a key={key} href={href} className="underline underline-offset-2 hover:text-peach-deep">
            {m[3]}
          </a>
        ) : (
          m[3]
        ),
      );
    }
    last = idx + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let n = 0;

  const flushPara = () => {
    if (para.length) {
      const k = `p${n++}`;
      blocks.push(<p key={k}>{inline(para.join(" "), k)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${n++}`;
      const items = list.items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>);
      blocks.push(
        list.ordered ? (
          <ol key={k} className="list-decimal space-y-1 pl-6">{items}</ol>
        ) : (
          <ul key={k} className="list-disc space-y-1 pl-6">{items}</ul>
        ),
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (h) {
      flushPara();
      flushList();
      const k = `h${n++}`;
      blocks.push(
        h[1].length === 2 ? (
          <h2 key={k} className="font-display text-2xl font-semibold tracking-tight">{inline(h[2], k)}</h2>
        ) : (
          <h3 key={k} className="font-display text-xl font-semibold tracking-tight">{inline(h[2], k)}</h3>
        ),
      );
    } else if (ul || ol) {
      flushPara();
      const ordered = !ul;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return <div className={`space-y-4 text-[1.0625rem] leading-relaxed ${className ?? ""}`}>{blocks}</div>;
}
