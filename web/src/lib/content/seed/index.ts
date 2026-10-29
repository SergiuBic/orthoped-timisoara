import type { Locale } from "@/i18n/routing";
import type { AiSettings, SiteContent, SiteSettings } from "../types";
import { ro } from "./ro";
import { en } from "./en";
import { it } from "./it";

// PLACEHOLDER values are marked "TODO-DOCTOR" so the admin overview can flag unreviewed fields.
export const seedSettings: SiteSettings = {
  doctorName: "Dr. Andrea Pasquini",
  doctorTitles: "MD, MSc, BScN",
  clinicName: "Dr. Andrea Pasquini – Ortopedie și Traumatologie",
  phone: "+40700000000",
  phoneDisplay: "0700 000 000",
  whatsapp: "+40700000000",
  email: "",
  address: {
    street: "TODO-DOCTOR Strada Exemplu 1",
    city: { ro: "Timișoara", en: "Timisoara", it: "Timișoara" },
    region: "Timiș",
    postalCode: "300000",
    countryCode: "RO",
    lat: 45.7489,
    lng: 21.2087,
    mapsUrl: "https://maps.google.com/?q=Timisoara",
  },
  hours: [
    { day: "Mo", opens: "09:00", closes: "18:00" },
    { day: "Tu", opens: "09:00", closes: "18:00" },
    { day: "We", opens: "09:00", closes: "18:00" },
    { day: "Th", opens: "09:00", closes: "18:00" },
    { day: "Fr", opens: "09:00", closes: "16:00" },
  ],
  social: {
    linkedin: "https://it.linkedin.com/in/andrea-pasquini-md-msc-bscn-022434159",
    researchgate: "https://www.researchgate.net/profile/Andrea-Pasquini-7",
  },
  doctorPhotoId: null,
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
};

export const seedContent: Record<Locale, SiteContent> = { ro, en, it };

export const seedAiSettings: AiSettings = {
  enabled: true,
  assistantName: "Asistent Dr. Pasquini",
  persona:
    "You speak on behalf of Dr. Andrea Pasquini's practice: warm, calm, precise, evidence-based. Italian-born orthopaedic surgeon practicing in {city}, focused on knee, sports injuries and trauma. Short answers, plain language, always helpful toward booking a visit.",
  rules: [
    "Never diagnose or prescribe; explain general information only.",
    "For emergencies (open fracture, severe bleeding, numbness, deformity) tell the user to call 112 immediately.",
    "Do not quote prices unless they appear in the knowledge base.",
  ],
  greeting: {
    ro: "Bună! Sunt asistentul virtual al Dr. Pasquini. Cu ce vă pot ajuta?",
    en: "Hi! I'm Dr. Pasquini's virtual assistant. How can I help?",
    it: "Ciao! Sono l'assistente virtuale del Dr. Pasquini. Come posso aiutarti?",
  },
  suggestions: {
    ro: ["Mă doare genunchiul", "Ruptură de ligament (LCA)", "Cum fac o programare?"],
    en: ["My knee hurts", "ACL tear", "How do I book a visit?"],
    it: ["Mi fa male il ginocchio", "Rottura del crociato (LCA)", "Come prenoto una visita?"],
  },
  model: process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash",
  temperature: 0.3,
  maxMessagesPerSession: 30,
  dailyGlobalLimit: 800,
};
