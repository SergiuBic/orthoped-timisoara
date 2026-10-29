"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics/client";

/** No iframe on load (privacy + performance). The embed is injected on click. */
export function MapCard({
  street,
  postalCode,
  city,
  lat,
  lng,
  mapsUrl,
}: {
  street: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}) {
  const t = useTranslations("Site");
  const [loaded, setLoaded] = useState(false);
  const d = 0.006;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative min-h-56 flex-1 overflow-hidden rounded-2xl bg-peach-soft/50 dark:bg-navy-2/40">
        {loaded ? (
          <iframe
            src={src}
            title={t("a11y.map")}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center">
            <div>
              <Icon name="MapPin" className="mx-auto size-8 text-peach-deep" />
              <p className="mt-2 font-medium">{street}</p>
              <p className="text-sm text-muted">
                {postalCode} {city}
              </p>
              <Button variant="ghost" className="mt-4" onClick={() => setLoaded(true)}>
                {t("actions.loadMap")}
              </Button>
            </div>
          </div>
        )}
      </div>
      <Button
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
        onClick={() => track("click_maps", "contact")}
      >
        <Icon name="MapPin" className="size-5" />
        {t("actions.openMaps")}
      </Button>
    </div>
  );
}
