import "server-only";
import { eq } from "drizzle-orm";
import { tool } from "ai";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { recordEvent } from "@/lib/analytics/server";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/lib/content/types";
import { retrieve } from "./retrieve";

const PHONE_RE = /^[+0-9 ()-]{6,20}$/; // same as /api/lead
const TZ = "Europe/Bucharest";
const DAY_KEYS: Record<string, string> = { Mon: "Mo", Tue: "Tu", Wed: "We", Thu: "Th", Fri: "Fr", Sat: "Sa", Sun: "Su" };

function isOpenNow(hours: SiteSettings["hours"]) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAY_KEYS[get("weekday")];
  const now = `${get("hour")}:${get("minute")}`;
  return hours.some((h) => h.day === day && now >= h.opens && now < h.closes);
}

export type ToolCtx = {
  locale: Locale;
  settings: SiteSettings;
  sessionId: string | null; // null = admin preview (nothing is persisted)
  visitor: string | null;
};

export function createTools(ctx: ToolCtx) {
  const { locale, settings, sessionId } = ctx;
  return {
    searchKnowledge: tool({
      description: "Search the doctor's knowledge base (documents and website content). Use a focused query.",
      inputSchema: z.object({ query: z.string().min(2).max(300) }),
      execute: async ({ query }) => {
        const rows = await retrieve(query, locale, 5);
        return rows.map((r, i) => ({ n: i + 1, text: r.content }));
      },
    }),
    getPracticeInfo: tool({
      description: "Get the practice phone, WhatsApp, address, opening hours and whether it is open now.",
      inputSchema: z.object({}),
      execute: async () => ({
        phone: settings.phoneDisplay,
        phoneE164: settings.phone,
        whatsapp: settings.whatsapp || null,
        address: `${settings.address.street}, ${settings.address.city[locale]}`,
        hours: settings.hours,
        openNow: isOpenNow(settings.hours),
        mapsUrl: settings.address.mapsUrl,
      }),
    }),
    requestCallback: tool({
      description:
        "Register a callback request. Only call after the user gave their name, phone number and explicitly agreed to be contacted (consent=true).",
      inputSchema: z.object({
        name: z.string().min(2).max(80),
        phone: z.string().min(6).max(20),
        note: z.string().max(500).optional(),
        consent: z.boolean(),
      }),
      execute: async ({ name, phone, note, consent }) => {
        const n = name.trim();
        const p = phone.trim();
        if (!consent) return { ok: false, message: "Consent is required before saving contact details." };
        if (n.length < 2 || !PHONE_RE.test(p)) return { ok: false, message: "Invalid name or phone number." };
        if (!sessionId) return { ok: true, message: "Preview mode: nothing was saved." };
        try {
          await db.insert(schema.leads).values({
            name: n,
            phone: p,
            message: note?.trim() || null,
            source: "chat",
            locale,
            consent: true,
            chatSessionId: sessionId,
          });
          await db.update(schema.chatSessions).set({ hasLead: true }).where(eq(schema.chatSessions.id, sessionId));
          await recordEvent({
            type: "chat_lead",
            placement: "chat",
            locale,
            visitorHash: ctx.visitor,
          }).catch(() => {});
          return { ok: true, message: "Callback request saved. The practice will call back." };
        } catch {
          return { ok: false, message: "Could not save the request." };
        }
      },
    }),
  };
}

export type ChatTools = ReturnType<typeof createTools>;
