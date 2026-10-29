import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const city = s.address.city.ro;
  return {
    name: `${s.doctorName} – Ortoped ${city}`,
    short_name: `Ortoped ${city}`,
    description: s.clinicName,
    start_url: "/ro",
    display: "standalone",
    theme_color: "#0F1E3D",
    background_color: "#F0EEE9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
