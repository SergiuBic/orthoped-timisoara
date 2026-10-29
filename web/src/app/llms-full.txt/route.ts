import { renderLlmsFull, TEXT_HEADERS } from "@/lib/seo/markdown";

export async function GET() {
  return new Response(await renderLlmsFull(), { headers: TEXT_HEADERS });
}
