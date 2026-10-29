import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getContent, getSettings } from "@/lib/content";
import { locales } from "@/i18n/routing";
import { embedDocs } from "./embed";
import { chunk } from "./chunk";

type Doc = { locale: string; title: string; text: string; kind: string; ref?: string };

export async function reindexSite(): Promise<{ chunks: number }> {
  const settings = await getSettings();
  const docs: Doc[] = [];
  for (const locale of locales) {
    const c = await getContent(locale);
    for (const s of c.services.items) {
      docs.push({ locale, kind: "service", ref: s.id, title: s.title, text: `${s.title}\n${s.summary}\n\n${s.body}` });
    }
    for (const f of c.faq.items) {
      docs.push({ locale, kind: "faq", title: f.q, text: `${f.q}\n${f.a}` });
    }
    docs.push({
      locale,
      kind: "about",
      title: c.about.heading,
      text: `${c.about.heading}\n${c.about.body}\n${c.about.credentials.join("\n")}\n${c.about.languages.join(", ")}`,
    });
    docs.push({
      locale,
      kind: "process",
      title: c.process.heading,
      text: `${c.process.heading}\n${c.process.steps.map((s) => `${s.title}: ${s.text}`).join("\n")}`,
    });
    const a = settings.address;
    const hours = settings.hours.map((h) => `${h.day} ${h.opens}-${h.closes}`).join(", ");
    docs.push({
      locale,
      kind: "practice",
      title: c.contact.heading,
      text:
        `${c.contact.heading}\n${c.contact.text}\n${settings.clinicName} - ${settings.doctorName}\n` +
        `${a.street}, ${a.postalCode} ${a.city[locale]}, ${a.region}, ${a.countryCode}\n` +
        `Tel: ${settings.phoneDisplay}${settings.whatsapp ? ` / WhatsApp ${settings.whatsapp}` : ""}\n` +
        `${hours ? `Program: ${hours}\n` : ""}${c.contact.emergencyNote}`,
    });
  }

  const items: { locale: string; content: string; metadata: Record<string, unknown> }[] = [];
  for (const d of docs) {
    const parts = d.text.length > 1500 ? chunk(d.text, { size: 1200, overlap: 150 }) : [d.text.trim()];
    for (const p of parts) {
      if (p.length < 10) continue;
      items.push({ locale: d.locale, content: p, metadata: { kind: d.kind, title: d.title, ref: d.ref } });
    }
  }

  // Embed first: if it fails (e.g. missing key / quota), the existing site chunks stay intact.
  const vectors = await embedDocs(items.map((i) => i.content));
  const { knowledgeChunks } = schema;
  await db.transaction(async (tx) => {
    await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.source, "site"));
    for (let i = 0; i < items.length; i += 100) {
      await tx.insert(knowledgeChunks).values(
        items.slice(i, i + 100).map((it, j) => ({
          fileId: null,
          source: "site",
          locale: it.locale,
          content: it.content,
          metadata: it.metadata,
          embedding: vectors[i + j],
        })),
      );
    }
  });
  return { chunks: items.length };
}
