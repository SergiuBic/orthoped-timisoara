import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { loadSeoData } from "@/lib/seo/markdown";
import { getLastModified } from "@/lib/seo/lastmod";
import { abs, homePath, languageAlternates, privacyPath, servicePath } from "@/lib/seo/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings, all } = await loadSeoData();
  const lastModified = new Date(await getLastModified());
  const out: MetadataRoute.Sitemap = [];
  for (const l of locales) {
    out.push({
      url: abs(settings, homePath(l)), lastModified, changeFrequency: "weekly", priority: 1,
      alternates: { languages: languageAlternates(settings, homePath) },
    });
    for (const svc of all[l].services.items) {
      const pathFor = (x: (typeof locales)[number]) => {
        const s = all[x].services.items.find((i) => i.id === svc.id);
        return s ? servicePath(x, s.slug) : null;
      };
      out.push({
        url: abs(settings, servicePath(l, svc.slug)), lastModified, changeFrequency: "monthly", priority: 0.8,
        alternates: { languages: languageAlternates(settings, pathFor) },
      });
    }
    out.push({
      url: abs(settings, privacyPath(l)), lastModified, changeFrequency: "yearly", priority: 0.2,
      alternates: { languages: languageAlternates(settings, privacyPath) },
    });
  }
  return out;
}
