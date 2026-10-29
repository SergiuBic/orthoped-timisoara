// Single source of truth for the database. Owned by the foundation; agents MUST NOT change
// existing columns. Additive changes require a new drizzle migration (pnpm db:generate).
import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const EMBEDDING_DIMS = 768;

const vector = customType<{ data: number[]; driverData: string }>({
  dataType: () => `vector(${EMBEDDING_DIMS})`,
  toDriver: (v) => `[${v.join(",")}]`,
  fromDriver: (v) => JSON.parse(v as string),
});

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

const ts = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

/* ───────────── Auth (better-auth core schema) ───────────── */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("admin"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

/* ───────────── Site settings & content ───────────── */
// Exactly one row, id = 1. Shape of `data` = SiteSettings (src/lib/content/types.ts).
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").notNull(),
  updatedAt: ts("updated_at"),
});

// One row per (locale, key). `data` shape is defined per key in ContentSchemas.
export const content = pgTable(
  "content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locale: text("locale").notNull(),
    key: text("key").notNull(),
    data: jsonb("data").notNull(),
    updatedAt: ts("updated_at"),
  },
  (t) => [uniqueIndex("content_locale_key").on(t.locale, t.key)],
);

// Uploaded images (doctor photo, clinic photos). Files live in UPLOAD_DIR/media.
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  storagePath: text("storage_path").notNull(),
  mime: text("mime").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: jsonb("alt").$type<Record<string, string>>().notNull().default({}),
  createdAt: ts("created_at"),
});

/* ───────────── Conversion & analytics ───────────── */
export const eventType = pgEnum("event_type", [
  "page_view",
  "click_phone",
  "click_whatsapp",
  "click_maps",
  "click_email",
  "lead_submit",
  "chat_open",
  "chat_message",
  "chat_lead",
]);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: eventType("type").notNull(),
    locale: text("locale"),
    path: text("path"),
    placement: text("placement"), // e.g. "hero", "sticky_bar", "footer", "chat"
    referrerHost: text("referrer_host"),
    device: text("device"), // "mobile" | "tablet" | "desktop" | "fold"
    visitorHash: text("visitor_hash"), // sha256(ip|ua|dailySalt) – rotates daily, no cookies
    createdAt: ts("created_at"),
  },
  (t) => [index("events_type_created").on(t.type, t.createdAt), index("events_created").on(t.createdAt)],
);

export const leadStatus = pgEnum("lead_status", ["new", "contacted", "closed", "spam"]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  source: text("source").notNull(), // "form" | "chat"
  locale: text("locale").notNull(),
  consent: boolean("consent").notNull(),
  status: leadStatus("status").notNull().default("new"),
  chatSessionId: uuid("chat_session_id"),
  createdAt: ts("created_at"),
});

/* ───────────── AI: persona, knowledge, chats ───────────── */
// Exactly one row, id = 1. Shape of `data` = AiSettings (src/lib/content/types.ts).
export const aiSettings = pgTable("ai_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").notNull(),
  updatedAt: ts("updated_at"),
});

export const fileStatus = pgEnum("file_status", ["pending", "processing", "ready", "error"]);

export const knowledgeFiles = pgTable("knowledge_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  storagePath: text("storage_path").notNull(),
  status: fileStatus("status").notNull().default("pending"),
  error: text("error"),
  chunkCount: integer("chunk_count").notNull().default(0),
  createdAt: ts("created_at"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // null fileId + source="site" => chunk generated from website content (re-indexed on save)
    fileId: uuid("file_id").references(() => knowledgeFiles.id, { onDelete: "cascade" }),
    source: text("source").notNull(), // "file" | "site"
    locale: text("locale"), // null = unknown/any
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    embedding: vector("embedding").notNull(),
    tsv: tsvector("tsv")
      .notNull()
      .generatedAlwaysAs(sql`to_tsvector('simple', unaccent_immutable(content))`),
    createdAt: ts("created_at"),
  },
  (t) => [
    index("chunks_embedding_hnsw").using("hnsw", t.embedding.op("vector_cosine_ops")),
    index("chunks_tsv_gin").using("gin", t.tsv),
    index("chunks_file").on(t.fileId),
  ],
);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  locale: text("locale").notNull(),
  visitorHash: text("visitor_hash"),
  messageCount: integer("message_count").notNull().default(0),
  hasLead: boolean("has_lead").notNull().default(false),
  createdAt: ts("created_at"),
  lastMessageAt: ts("last_message_at"),
});

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    feedback: real("feedback"), // -1 | 1 (optional thumbs)
    createdAt: ts("created_at"),
  },
  (t) => [index("chat_messages_session").on(t.sessionId)],
);
