import type { SiteContent, SiteSettings } from "@/lib/content/types";
import type { Locale } from "@/i18n/routing";
import { abs, homePath } from "./urls";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const DAY: Record<string, string> = {
  Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday",
};
const practiceId = (s: SiteSettings) => `${abs(s, "")}#practice`;
const sameAs = (s: SiteSettings) => Object.values(s.social).filter((v): v is string => !!v);

export function physicianJsonLd(settings: SiteSettings, content: SiteContent, locale: Locale) {
  const a = settings.address;
  return {
    "@context": "https://schema.org",
    "@type": ["Physician", "MedicalBusiness"],
    "@id": practiceId(settings),
    name: settings.clinicName,
    description: content.seo.description,
    medicalSpecialty: ["https://schema.org/Orthopedic", "https://schema.org/SportsMedicine"],
    telephone: settings.phone,
    ...(settings.email ? { email: settings.email } : {}),
    url: abs(settings, homePath(locale)),
    image: abs(settings, "/images/doctor.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city[locale],
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng },
    openingHoursSpecification: settings.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY[h.day],
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { "@type": "City", name: a.city[locale] },
    availableLanguage: ["ro", "it", "en"],
    knowsLanguage: ["ro", "it", "en"],
    sameAs: sameAs(settings),
    priceRange: "$$",
    hasMap: a.mapsUrl,
  };
}

export function personJsonLd(settings: SiteSettings, content: SiteContent, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${abs(settings, "")}#doctor`,
    name: settings.doctorName,
    jobTitle: "Orthopedic Surgeon",
    description: content.about.credentials.join("; "),
    image: abs(settings, "/images/doctor.png"),
    url: abs(settings, homePath(locale)),
    worksFor: { "@id": practiceId(settings) },
    memberOf: { "@type": "Organization", name: "ESSKA", url: "https://www.esska.org" },
    knowsLanguage: content.about.languages,
    sameAs: sameAs(settings),
  };
}

export function faqJsonLd(faq: SiteContent["faq"]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function serviceJsonLd(
  settings: SiteSettings,
  service: SiteContent["services"]["items"][number],
  url: string,
) {
  const firstPara = service.body.split(/\n\s*\n/).find((p) => p.trim() && !p.startsWith("#"))?.replace(/[*_#]/g, "").trim();
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.title,
    description: service.summary,
    url,
    ...(firstPara ? { howPerformed: firstPara.slice(0, 300) } : {}),
    provider: { "@id": practiceId(settings) },
  };
}
