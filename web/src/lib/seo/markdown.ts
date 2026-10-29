import "server-only";
import { locales, type Locale } from "@/i18n/routing";
import { getContent, getSettings } from "@/lib/content";
import { abs, homePath, servicePath } from "./urls";

export async function loadSeoData() {
  const [settings, ...contents] = await Promise.all([getSettings(), ...locales.map((l) => getContent(l))]);
  const all = Object.fromEntries(locales.map((l, i) => [l, contents[i]])) as Record<Locale, (typeof contents)[number]>;
  return { settings, all };
}

export const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" };

export async function renderLlmsTxt(): Promise<string> {
  const { settings: s, all } = await loadSeoData();
  const a = s.address;
  const c = all.en;
  const addr = `${a.street}, ${a.postalCode} ${a.city.en}, ${a.region}, ${a.countryCode}`;
  const L: string[] = [
    `# ${s.doctorName} – Orthopedics & Traumatology in ${a.city.en}`,
    "",
    `> ${c.seo.description} Phone: ${s.phoneDisplay} (${s.phone}). Address: ${addr}. Languages: ${c.about.languages.join(", ")}.`,
    "",
    "## Pages",
    "",
  ];
  for (const l of locales) L.push(`- [${all[l].hero.h1} (${l.toUpperCase()})](${abs(s, homePath(l))}): ${all[l].seo.description}`);
  for (const l of locales)
    for (const svc of all[l].services.items)
      L.push(`- [${svc.seoTitle} (${l.toUpperCase()})](${abs(s, servicePath(l, svc.slug))}): ${svc.summary}`);
  L.push("", "## Full content", "", `- [llms-full.txt](${abs(s, "/llms-full.txt")}): complete site content as markdown`);
  L.push("", "## Contact", "", `- Phone: ${s.phoneDisplay}`);
  if (s.whatsapp) L.push(`- WhatsApp: https://wa.me/${s.whatsapp.replace(/\D/g, "")}`);
  if (s.email) L.push(`- Email: ${s.email}`);
  L.push(`- Address: ${addr}`, `- Map: ${a.mapsUrl}`, "");
  return L.join("\n");
}

export async function renderLlmsFull(): Promise<string> {
  const { settings: s, all } = await loadSeoData();
  const a = s.address;
  const c = all.en ?? all.ro;
  const addr = `${a.street}, ${a.postalCode} ${a.city.en}, ${a.region}, ${a.countryCode}`;
  const L: string[] = [
    `# ${c.hero.h1} – ${s.doctorName}`,
    "",
    `> ${c.seo.description}`,
    "",
    `## ${c.about.heading}`,
    "",
    c.about.body,
    "",
    ...c.about.credentials.map((x) => `- ${x}`),
    "",
    `Languages: ${c.about.languages.join(", ")}`,
    "",
    `## ${c.services.heading}`,
    "",
    c.services.intro,
    "",
  ];
  for (const svc of c.services.items) {
    L.push(`### ${svc.title}`, "", `URL: ${abs(s, servicePath("en", svc.slug))}`, "", svc.body, "");
  }
  L.push(`## ${c.faq.heading}`, "");
  for (const f of c.faq.items) L.push(`### ${f.q}`, "", f.a, "");
  L.push("## Opening hours", "", ...s.hours.map((h) => `- ${h.day}: ${h.opens}–${h.closes}`), "");
  L.push(`## ${c.contact.heading}`, "", c.contact.text, "", `- Phone: ${s.phoneDisplay} (${s.phone})`);
  if (s.whatsapp) L.push(`- WhatsApp: https://wa.me/${s.whatsapp.replace(/\D/g, "")}`);
  if (s.email) L.push(`- Email: ${s.email}`);
  L.push(`- Address: ${addr}`, `- Map: ${a.mapsUrl}`, "", `**${c.contact.emergencyNote}**`, "", "## Medical disclaimer", "", c.legal.medicalDisclaimer, "");
  return L.join("\n");
}
