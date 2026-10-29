import { renderLlmsTxt, TEXT_HEADERS } from "@/lib/seo/markdown";

export async function GET() {
  return new Response(await renderLlmsTxt(), { headers: TEXT_HEADERS });
}
