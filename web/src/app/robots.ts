import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";
import { stripSlash } from "@/lib/seo/urls";

const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot",
  "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "Meta-ExternalAgent",
  "Amazonbot", "CCBot", "cohere-ai", "MistralAI-User",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = stripSlash((await getSettings()).siteUrl);
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: AI_BOTS, allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
