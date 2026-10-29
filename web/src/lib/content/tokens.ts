export type TokenCtx = { city: string; doctor: string; phone: string };

export function resolveTokens(s: string, ctx: TokenCtx): string {
  return s.replaceAll("{city}", ctx.city).replaceAll("{doctor}", ctx.doctor).replaceAll("{phone}", ctx.phone);
}

export function resolveDeep<T>(value: T, ctx: TokenCtx): T {
  if (typeof value === "string") return resolveTokens(value, ctx) as T;
  if (Array.isArray(value)) return value.map((v) => resolveDeep(v, ctx)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDeep(v, ctx)])) as T;
  }
  return value;
}
