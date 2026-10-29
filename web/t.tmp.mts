import { config } from "dotenv"; config({ path: ".env.local" });
import { generateText, Output } from "ai";
const { google } = await import("@/lib/ai/gemini");
const { ContentSchemas } = await import("@/lib/content/types");
const { seedContent } = await import("@/lib/content/seed");
for (const key of ["hero","services"] as const) {
const schema = ContentSchemas[key];
const res = await generateText({
  model: google("gemini-3.8-flash"), temperature: 0.2,
  output: Output.object({ schema: schema as never }),
  system: "You translate website content for an orthopedic surgeon's clinic from Romanian into English. Keep the exact JSON structure. Keep placeholder tokens like {city}, {doctor}, {phone} unchanged and in place. Never translate id, icon and focus. Localize slug fields into English url slugs.",
  prompt: JSON.stringify(seedContent.ro[key]),
});
const out = schema.safeParse(res.output);
console.log(key, out.success, JSON.stringify(out.success ? out.data : out.error.issues).slice(0,500));
}
process.exit(0);
