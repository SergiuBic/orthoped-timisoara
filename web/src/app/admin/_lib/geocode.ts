// Nominatim geocoder (server-side, with a User-Agent as required by the usage policy).
export async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
    headers: { "User-Agent": "ortoped-admin/1.0 (clinic website admin)", "Accept-Language": "en" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { lat?: string; lon?: string }[];
  const first = j[0];
  if (!first?.lat || !first.lon) return null;
  const lat = Number(first.lat), lng = Number(first.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
