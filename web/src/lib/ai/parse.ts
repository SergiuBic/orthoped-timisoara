import { readFile } from "node:fs/promises";
import path from "node:path";

export type ParsedSection = { title?: string; text: string; page?: number; sheet?: string };
export type Parsed = { text: string; sections?: ParsedSection[] };

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

const kind = (p: string, mime: string) => {
  const ext = path.extname(p).toLowerCase();
  if (mime === "application/pdf" || ext === ".pdf") return "pdf";
  if (mime.includes("wordprocessingml") || ext === ".docx") return "docx";
  if (mime.includes("spreadsheetml") || ext === ".xlsx") return "xlsx";
  if (mime === "text/csv" || ext === ".csv") return "csv";
  if (mime === "text/markdown" || ext === ".md") return "txt";
  if (mime === "text/plain" || ext === ".txt") return "txt";
  return null;
};

const cellText = (v: unknown): string => {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.richText)) return o.richText.map((r) => (r as { text: string }).text).join("");
    if ("result" in o) return cellText(o.result);
    if ("text" in o) return cellText(o.text);
    if ("error" in o) return "";
    return String(v);
  }
  return String(v).trim();
};

export async function parseFile(filePath: string, mime: string): Promise<Parsed> {
  const k = kind(filePath, mime);
  if (!k) throw new Error(`Unsupported type: ${mime || path.extname(filePath)}`);
  const buf = await readFile(filePath);
  if (buf.length > MAX_FILE_BYTES) throw new Error("File too large (max 20 MB)");

  if (k === "txt") {
    const text = buf.toString("utf-8");
    return { text };
  }

  if (k === "pdf") {
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(buf), { mergePages: false });
    const pages = Array.isArray(text) ? text : [text];
    const sections = pages.map((t, i) => ({ text: t, page: i + 1 })).filter((s) => s.text.trim());
    return { text: sections.map((s) => s.text).join("\n\n"), sections };
  }

  if (k === "docx") {
    const mammoth = (await import("mammoth")).default;
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return { text: value };
  }

  // xlsx / csv
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  if (k === "csv") {
    const { Readable } = await import("node:stream");
    await wb.csv.read(Readable.from(buf));
  } else {
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
  }
  const sections: ParsedSection[] = [];
  wb.eachSheet((ws) => {
    let headers: string[] = [];
    const lines: string[] = [];
    ws.eachRow((row, n) => {
      const vals = (row.values as unknown[]).slice(1).map(cellText);
      if (n === 1 || !headers.length) {
        headers = vals;
        return;
      }
      const parts = vals.map((v, i) => (v ? `${headers[i] || `Col${i + 1}`}: ${v}` : "")).filter(Boolean);
      if (parts.length) lines.push(parts.join("; "));
    });
    if (lines.length) sections.push({ title: ws.name, sheet: ws.name, text: lines.join("\n") });
  });
  return { text: sections.map((s) => `${s.title}\n${s.text}`).join("\n\n"), sections };
}
