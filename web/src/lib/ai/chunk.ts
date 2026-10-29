export type Chunk = { text: string; locale: "ro" | "en" | "it" };

export function detectLocale(s: string): "ro" | "en" | "it" {
  if (/[ăâîșțşţ]/i.test(s)) return "ro";
  const words = s.toLowerCase().match(/[a-zà-ù']+/g) ?? [];
  const it = new Set(["il", "che", "della", "per", "di", "con", "una", "sono", "delle", "nel", "gli"]);
  const en = new Set(["the", "and", "of", "to", "is", "with", "for", "your", "are"]);
  let a = 0;
  let b = 0;
  for (const w of words) {
    if (it.has(w)) a++;
    else if (en.has(w)) b++;
  }
  return a > b && a >= 2 ? "it" : "en";
}

function splitSentences(p: string): string[] {
  return p.match(/[^.!?\n]+[.!?]+["')\]]*\s*|[^.!?\n]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [p];
}

/** Split on paragraphs/headings first, then sentences; pack up to `size` chars with `overlap` carried over. */
export function chunk(text: string, { size = 1200, overlap = 200 } = {}): string[] {
  const units: string[] = [];
  for (const para of text.replace(/\r\n/g, "\n").split(/\n\s*\n|\n(?=#{1,6}\s)/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.length <= size) {
      units.push(p);
      continue;
    }
    for (const line of p.split("\n")) {
      if (!line.trim()) continue;
      const parts = line.length <= size ? [line.trim()] : splitSentences(line);
      for (const s of parts) {
        if (s.length <= size) units.push(s);
        else for (let i = 0; i < s.length; i += size) units.push(s.slice(i, i + size)); // hard split
      }
    }
  }

  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur.trim()) chunks.push(cur.trim());
  };
  for (const u of units) {
    if (cur && cur.length + u.length + 2 > size) {
      flush();
      let tail = cur.slice(-overlap);
      const sp = tail.search(/\s/);
      if (sp > 0 && sp < tail.length - 1) tail = tail.slice(sp + 1);
      cur = overlap > 0 ? tail : "";
    }
    cur = cur ? `${cur}\n${u}` : u;
  }
  flush();
  return chunks.filter((c) => c.length >= 40);
}

export function chunkWithLocale(text: string, o?: { size?: number; overlap?: number }): Chunk[] {
  return chunk(text, o).map((t) => ({ text: t, locale: detectLocale(t) }));
}
