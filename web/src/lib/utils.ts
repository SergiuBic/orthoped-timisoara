import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Constant-time check for n8n -> Next internal calls (header `x-internal-secret`). */
export function isInternal(req: Request) {
  const got = req.headers.get("x-internal-secret") ?? "";
  const want = process.env.INTERNAL_SECRET ?? "";
  if (!want || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}
