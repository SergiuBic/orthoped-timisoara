import { embed, embedMany } from "ai";
import { google } from "./gemini";

const model = google.textEmbeddingModel(process.env.GEMINI_EMBED_MODEL ?? "gemini-embedding-001");

type TaskType = "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT";
const opts = (taskType: TaskType) => ({
  providerOptions: { google: { outputDimensionality: 768, taskType } },
});

function normalize(v: number[]): number[] {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}

function assertKey() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
}

export async function embedQuery(text: string): Promise<number[]> {
  assertKey();
  const { embedding } = await embed({ model, value: text, ...opts("RETRIEVAL_QUERY") });
  return normalize(embedding);
}

const BATCH = 50;
export async function embedDocs(texts: string[]): Promise<number[][]> {
  if (texts.length) assertKey();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1000));
    const { embeddings } = await embedMany({
      model,
      values: texts.slice(i, i + BATCH),
      ...opts("RETRIEVAL_DOCUMENT"),
    });
    out.push(...embeddings.map(normalize));
  }
  return out;
}
