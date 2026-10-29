import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { Locale } from "@/i18n/routing";
import { embedQuery } from "./embed";

export type Retrieved = {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: Record<string, unknown>;
};

type Row = {
  id: string;
  content: string;
  source: string;
  locale: string | null;
  metadata: Record<string, unknown>;
  sim?: number;
};

const RRF_K = 60;
const MIN_SIM = 0.35;

/** Hybrid search: pgvector cosine + Postgres full-text, merged with Reciprocal Rank Fusion. */
export async function retrieve(query: string, locale: Locale, k = 6): Promise<Retrieved[]> {
  const q = query.trim().slice(0, 1000);
  if (!q) return [];

  let vec: string | null = null;
  try {
    vec = `[${(await embedQuery(q)).join(",")}]`;
  } catch {
    vec = null; // embeddings unavailable: keyword-only
  }

  const [vecRows, kwRows] = await Promise.all([
    vec
      ? db
          .execute<Row>(
            sql`SELECT id, content, source, locale, metadata, 1 - (embedding <=> ${vec}::vector) AS sim
                FROM knowledge_chunks ORDER BY embedding <=> ${vec}::vector LIMIT 20`,
          )
          .catch(() => [] as Row[])
      : Promise.resolve([] as Row[]),
    db
      .execute<Row>(
        sql`SELECT id, content, source, locale, metadata,
                   ts_rank(tsv, plainto_tsquery('simple', unaccent_immutable(${q}))) AS rank
            FROM knowledge_chunks
            WHERE tsv @@ plainto_tsquery('simple', unaccent_immutable(${q}))
            ORDER BY rank DESC LIMIT 20`,
      )
      .catch(() => [] as Row[]),
  ]);

  const merged = new Map<string, { row: Row; score: number; kw: boolean }>();
  const add = (rows: Row[], kw: boolean) =>
    rows.forEach((row, i) => {
      const cur = merged.get(row.id) ?? { row, score: 0, kw: false };
      cur.score += 1 / (RRF_K + i + 1);
      if (kw) cur.kw = true;
      else cur.row = { ...cur.row, sim: Number(row.sim) };
      merged.set(row.id, cur);
    });
  add([...vecRows], false);
  add([...kwRows], true);

  return [...merged.values()]
    .filter((m) => m.kw || (m.row.sim ?? 0) >= MIN_SIM)
    .map((m) => ({ ...m, score: m.score * (m.row.locale === locale ? 1.1 : 1) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((m) => ({
      id: m.row.id,
      content: m.row.content,
      source: m.row.source,
      score: m.score,
      metadata: m.row.metadata ?? {},
    }));
}
