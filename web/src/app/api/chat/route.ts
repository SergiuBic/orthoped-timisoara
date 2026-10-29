import { getTranslations } from "next-intl/server";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, type UIMessage } from "ai";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getAdminOrNull } from "@/lib/auth";
import { clientIp, recordEvent, visitorHash } from "@/lib/analytics/server";
import { getAiSettings, getSettings } from "@/lib/content";
import { locales, type Locale } from "@/i18n/routing";
import { chatModel } from "@/lib/ai/gemini";
import { retrieve, type Retrieved } from "@/lib/ai/retrieve";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { createTools } from "@/lib/ai/tools";
import { checkLimit, countReply } from "@/lib/ai/ratelimit";

export const maxDuration = 60;

const MAX_USER_CHARS = 1000;
const HISTORY = 12;

const Body = z.object({
  messages: z.array(z.object({ role: z.string(), parts: z.array(z.looseObject({ type: z.string() })) }).loose()).min(1).max(200),
  sessionId: z.string().uuid().nullish(),
  locale: z.enum(locales),
});

type Meta = { sessionId?: string };
const textOf = (m: { parts: { type: string; text?: unknown }[] }) =>
  m.parts.map((p) => (p.type === "text" && typeof p.text === "string" ? p.text : "")).join("");

/** A complete assistant reply streamed as plain text (used for fallbacks). */
function textResponse(text: string, sessionId: string | null, status = 200) {
  const stream = createUIMessageStream<UIMessage<Meta>>({
    execute: ({ writer }) => {
      writer.write({ type: "start", messageMetadata: sessionId ? { sessionId } : undefined });
      writer.write({ type: "text-start", id: "fb" });
      writer.write({ type: "text-delta", id: "fb", delta: text });
      writer.write({ type: "text-end", id: "fb" });
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({
    status,
    stream,
    headers: sessionId ? { "x-chat-session": sessionId } : undefined,
  });
}

export async function POST(req: Request) {
  const ai = await getAiSettings();
  if (!ai.enabled) return new Response("Not found", { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { messages, locale } = parsed.data;
  const last = messages[messages.length - 1];
  if (last.role !== "user") return Response.json({ error: "invalid" }, { status: 400 });
  const lastText = textOf(last as { parts: { type: string; text?: unknown }[] }).trim();
  if (!lastText) return Response.json({ error: "empty" }, { status: 400 });
  if (lastText.length > MAX_USER_CHARS) {
    return Response.json({ error: "too_long", max: MAX_USER_CHARS }, { status: 400 });
  }

  const settings = await getSettings();
  const t = await getTranslations({ locale: locale as Locale, namespace: "Chat" });
  const phone = settings.phoneDisplay;

  // Admin preview: no rate limit, nothing persisted.
  const preview = req.headers.get("x-admin-preview") === "1" && (await getAdminOrNull()) !== null;

  const ua = req.headers.get("user-agent") ?? "";
  const visitor = visitorHash(clientIp(req.headers), ua);

  if (!preview) {
    const limit = await checkLimit(visitor, ai.dailyGlobalLimit);
    if (!limit.ok) return textResponse(t("rateLimited", { phone }), null);
    if (messages.length > ai.maxMessagesPerSession) return textResponse(t("limitReached", { phone }), parsed.data.sessionId ?? null);
  }

  // Session + user message
  let sessionId: string | null = null;
  if (!preview) {
    try {
      const wanted = parsed.data.sessionId;
      if (wanted) {
        const [row] = await db.select({ id: schema.chatSessions.id }).from(schema.chatSessions).where(eq(schema.chatSessions.id, wanted)).limit(1);
        sessionId = row?.id ?? null;
      }
      if (!sessionId) {
        const [row] = await db.insert(schema.chatSessions).values({ locale, visitorHash: visitor }).returning({ id: schema.chatSessions.id });
        sessionId = row.id;
      }
      await db.insert(schema.chatMessages).values({ sessionId, role: "user", content: lastText });
      await db
        .update(schema.chatSessions)
        .set({ messageCount: sql`${schema.chatSessions.messageCount} + 1`, lastMessageAt: new Date() })
        .where(eq(schema.chatSessions.id, sessionId));
    } catch (e) {
      console.error("[chat] session error", e);
    }
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return textResponse(t("fallback", { phone }), sessionId);

  let context: Retrieved[] = [];
  try {
    context = await retrieve(lastText, locale, 6);
  } catch (e) {
    console.error("[chat] retrieve error", e);
  }

  const recent = messages.slice(-HISTORY) as unknown as Omit<UIMessage, "id">[];
  while (recent.length && recent[0].role !== "user") recent.shift();

  const tools = createTools({ locale, settings, sessionId, visitor });
  const result = streamText({
    model: chatModel(ai.model),
    system: buildSystemPrompt({ ai, settings, locale, context }),
    messages: await convertToModelMessages(recent),
    tools,
    stopWhen: stepCountIs(4),
    temperature: ai.temperature,
    maxOutputTokens: 600,
    onError: ({ error }) => console.error("[chat] model error", error),
    onFinish: async ({ text }) => {
      if (preview) return;
      countReply();
      {
        try {
          if (sessionId && text.trim()) {
            await db.insert(schema.chatMessages).values({ sessionId, role: "assistant", content: text });
            await db
              .update(schema.chatSessions)
              .set({ messageCount: sql`${schema.chatSessions.messageCount} + 1`, lastMessageAt: new Date() })
              .where(eq(schema.chatSessions.id, sessionId));
          }
          await recordEvent({ type: "chat_message", placement: "chat", locale, visitorHash: visitor });
        } catch (e) {
          console.error("[chat] persist error", e);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse<UIMessage<Meta>>({
    headers: sessionId ? { "x-chat-session": sessionId } : undefined,
    messageMetadata: ({ part }) => (part.type === "start" && sessionId ? { sessionId } : undefined),
    onError: () => "model_error",
  });
}
