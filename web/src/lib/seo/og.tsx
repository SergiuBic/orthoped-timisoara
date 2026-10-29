import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

async function loadFont() {
  try {
    const files = ["Fraunces-latin-400.woff", "Fraunces-latin-ext-400.woff"];
    return await Promise.all(
      files.map(async (f) => {
        const buf = await readFile(path.join(process.cwd(), "public/fonts", f));
        return { name: "Fraunces", data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, weight: 400 as const };
      }),
    );
  } catch {
    return undefined;
  }
}

export async function renderOg(opts: { title: string; subtitle?: string; doctor: string; phone: string }) {
  const fonts = await loadFont();
  const family = fonts ? "Fraunces" : "sans-serif";
  const size = opts.title.length > 40 ? 64 : 84;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: "#F0EEE9", color: "#0F1E3D", fontFamily: family, position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -150, top: -150, width: 700, height: 700, borderRadius: 700, display: "flex",
          background: "radial-gradient(circle, rgba(255,190,152,0.95) 0%, rgba(255,190,152,0) 70%)" }} />
        <svg width="240" height="240" viewBox="0 0 64 64" style={{ position: "absolute", right: 70, bottom: 60, opacity: 0.9 }}>
          <g fill="none" stroke="#0F1E3D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 12c-5-5-12 2-6 7 2 1.5 5 1.5 6.5-.5L28 30 40 42c-1.500 2-1.500 5 .5 6.500 5 6 12-1 7-6-1.500-1.500-4-2-6-.5L30 30 18.500 18c2-1.500 2-4-.5-6" />
          </g>
        </svg>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.7 }}>
          {opts.doctor}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ display: "flex", fontSize: size, lineHeight: 1.05 }}>{opts.title}</div>
          {opts.subtitle ? <div style={{ display: "flex", fontSize: 34, marginTop: 24, opacity: 0.75 }}>{opts.subtitle}</div> : null}
        </div>
        <div style={{ display: "flex", fontSize: 34 }}>{opts.phone}</div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
