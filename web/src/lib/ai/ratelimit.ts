import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// In-memory (single instance): per visitor 20 messages / 10 min, plus a global daily counter.
const WINDOW_MS = 10 * 60 * 1000;
const PER_VISITOR = 20;
const hits = new Map<string, number[]>();

let day = "";
let dayCount: number | null = null;
let loading: Promise<void> | null = null;

const today = () => new Date().toISOString().slice(0, 10);

async function ensureDay() {
  if (dayCount !== null && day === today()) return;
  if (!loading) {
    loading = (async () => {
      day = today();
      try {
        const start = new Date(`${day}T00:00:00.000Z`);
        const [row] = await db
          .select({ n: sql<number>`count(*)::int` })
          .from(schema.events)
          .where(and(eq(schema.events.type, "chat_message"), gte(schema.events.createdAt, start)));
        dayCount = row?.n ?? 0;
      } catch {
        dayCount = 0;
      }
    })().finally(() => {
      loading = null;
    });
  }
  await loading;
}

export type LimitResult = { ok: true } | { ok: false; reason: "visitor" | "global" };

/** Checks and, when allowed, consumes one visitor slot. The global counter is bumped by `countReply`. */
export async function checkLimit(visitor: string, dailyGlobalLimit: number): Promise<LimitResult> {
  await ensureDay();
  if ((dayCount ?? 0) >= dailyGlobalLimit) return { ok: false, reason: "global" };
  const now = Date.now();
  const recent = (hits.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_VISITOR) {
    hits.set(visitor, recent);
    return { ok: false, reason: "visitor" };
  }
  recent.push(now);
  hits.set(visitor, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return { ok: true };
}

export function countReply() {
  if (day !== today()) {
    day = today();
    dayCount = 0;
  }
  dayCount = (dayCount ?? 0) + 1;
}
