import Image from "next/image";
import type { SiteSettings } from "@/lib/content/types";

export function doctorPhotoSrc(s: SiteSettings) {
  return s.doctorPhotoId ? `/media/${s.doctorPhotoId}` : "/images/doctor.png";
}

export function DoctorPhoto({
  settings,
  priority,
  sizes,
}: {
  settings: SiteSettings;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <Image
      src={doctorPhotoSrc(settings)}
      alt={`${settings.doctorName}, ${settings.doctorTitles}`}
      fill
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      className="object-cover object-top"
    />
  );
}
