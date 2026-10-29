// Content contracts shared by: public site, SEO, admin editor, AI indexer.
// Admin forms are generated from these zod schemas, so every field has a .describe() label.
import { z } from "zod";
import type { Locale } from "@/i18n/routing";

const localized = <T extends z.ZodTypeAny>(s: T) => z.object({ ro: s, en: s, it: s });

/* ───────── Global (non-localized) settings: NAP + SEO binding ───────── */
export const OpeningHoursSchema = z.object({
  day: z.enum(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]),
  opens: z.string().regex(/^\d{2}:\d{2}$/).describe("Opens (HH:MM)"),
  closes: z.string().regex(/^\d{2}:\d{2}$/).describe("Closes (HH:MM)"),
});

export const SiteSettingsSchema = z.object({
  doctorName: z.string().min(2).describe("Doctor full name, e.g. Dr. Andrea Pasquini"),
  doctorTitles: z.string().describe("Titles shown after name, e.g. MD, MSc, BScN"),
  clinicName: z.string().describe("Clinic / practice name"),
  phone: z.string().describe("Phone in E.164, e.g. +40700000000 (primary conversion)"),
  phoneDisplay: z.string().describe("Phone as shown, e.g. 0700 000 000"),
  whatsapp: z.string().describe("WhatsApp number E.164 (empty = hide)"),
  email: z.string().email().or(z.literal("")).describe("Public email (empty = hide)"),
  address: z.object({
    street: z.string().describe("Street + number"),
    // City drives ALL SEO (titles, H1, JSON-LD, sitemap). Changing it re-targets the site.
    city: localized(z.string()).describe("City name per language (drives SEO everywhere)"),
    region: z.string().describe("County / region, e.g. Timiș"),
    postalCode: z.string(),
    countryCode: z.string().length(2).describe("ISO country, e.g. RO"),
    lat: z.number(),
    lng: z.number(),
    mapsUrl: z.string().url().describe("Google Maps link for the Directions button"),
  }),
  hours: z.array(OpeningHoursSchema).describe("Opening hours"),
  social: z.object({
    linkedin: z.string().optional(),
    researchgate: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }),
  doctorPhotoId: z.string().uuid().nullable().describe("Media id; null = /images/doctor.png"),
  siteUrl: z.string().url().describe("Canonical origin, e.g. https://ortopedtimisoara.ro"),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

/* ───────── Localized content blocks: one row per (locale, key) ───────── */
// Any string may contain the tokens {city}, {doctor}, {phone} – resolved by lib/content/tokens.ts
const Cta = z.object({ label: z.string() });
const Card = z.object({ title: z.string(), text: z.string(), icon: z.string().describe("lucide icon name") });

export const ContentSchemas = {
  seo: z.object({
    titleTemplate: z.string().describe("Home <title>. Use {city}. e.g. Ortoped {city} | {doctor}"),
    description: z.string().max(170).describe("Meta description (≤160 chars ideal)"),
    keywords: z.array(z.string()).describe("Target keywords, may use {city}"),
  }),
  hero: z.object({
    eyebrow: z.string().describe("Small text above H1, e.g. Ortopedie și Traumatologie"),
    h1: z.string().describe("Main heading. MUST contain {city}. e.g. Ortoped {city}"),
    subtitle: z.string(),
    callCta: Cta,
    whatsappCta: Cta,
    mapsCta: Cta,
    highlights: z.array(z.string()).max(4).describe("Short chips, e.g. Chirurgie artroscopică"),
  }),
  trust: z.object({
    items: z.array(z.object({ value: z.string(), label: z.string() })).max(6),
  }),
  kneeStory: z.object({
    heading: z.string(),
    intro: z.string(),
    steps: z
      .array(z.object({ focus: z.enum(["overview", "acl", "meniscus", "cartilage", "patella"]), title: z.string(), text: z.string() }))
      .describe("Scroll steps; `focus` tells the 3D knee what to highlight"),
  }),
  traumaStory: z.object({
    heading: z.string(),
    intro: z.string(),
    steps: z
      .array(z.object({ focus: z.enum(["intact", "fracture", "reduction", "fixation", "healed"]), title: z.string(), text: z.string() }))
      .describe("Scroll steps; `focus` drives the 3D fracture animation phase"),
  }),
  services: z.object({
    heading: z.string(),
    intro: z.string(),
    items: z.array(
      z.object({
        id: z.string().describe("stable id, never translated"),
        slug: z.string().describe("URL slug in this language"),
        title: z.string(),
        summary: z.string().max(200),
        body: z.string().describe("Markdown for the service page"),
        icon: z.string(),
        seoTitle: z.string().describe("e.g. Reconstrucție LCA {city}"),
      }),
    ),
  }),
  about: z.object({
    heading: z.string(),
    body: z.string().describe("Markdown biography"),
    credentials: z.array(z.string()),
    languages: z.array(z.string()).describe("Languages spoken"),
  }),
  process: z.object({ heading: z.string(), steps: z.array(Card).max(5) }),
  faq: z.object({ heading: z.string(), items: z.array(z.object({ q: z.string(), a: z.string() })) }),
  contact: z.object({
    heading: z.string(),
    text: z.string(),
    formTitle: z.string(),
    emergencyNote: z.string().describe("e.g. For emergencies call 112"),
  }),
  legal: z.object({
    medicalDisclaimer: z.string(),
    privacyBody: z.string().describe("Markdown privacy policy"),
  }),
} as const;

export type ContentKey = keyof typeof ContentSchemas;
export type ContentOf<K extends ContentKey> = z.infer<(typeof ContentSchemas)[K]>;
export type SiteContent = { [K in ContentKey]: ContentOf<K> };
export const contentKeys = Object.keys(ContentSchemas) as ContentKey[];

/* ───────── AI persona ───────── */
export const AiSettingsSchema = z.object({
  enabled: z.boolean().describe("Show the chat assistant on the website"),
  assistantName: z.string().describe("e.g. Asistentul Dr. Pasquini"),
  persona: z.string().describe("Doctor's voice, tone, values – injected in system prompt"),
  rules: z.array(z.string()).describe("Extra hard rules, e.g. never quote prices"),
  greeting: localized(z.string()),
  suggestions: localized(z.array(z.string()).max(4)).describe("Quick-reply chips"),
  model: z.string().describe("Gemini model id, e.g. gemini-2.5-flash"),
  temperature: z.number().min(0).max(1),
  maxMessagesPerSession: z.number().int().min(4).max(100),
  dailyGlobalLimit: z.number().int().min(10).describe("Max assistant replies per day (free-tier guard)"),
});
export type AiSettings = z.infer<typeof AiSettingsSchema>;

export type { Locale };
