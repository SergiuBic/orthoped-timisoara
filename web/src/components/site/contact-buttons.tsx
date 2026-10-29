"use client";

import { useTranslations } from "next-intl";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { track, type Placement } from "@/lib/analytics/client";

type Base = {
  placement: Placement;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  className?: string;
};

export function PhoneButton({
  phone,
  phoneDisplay,
  showNumber,
  placement,
  label,
  variant = "primary",
  size = "md",
  className,
}: Base & { phone: string; phoneDisplay?: string; showNumber?: boolean }) {
  const t = useTranslations("Site.actions");
  const text = showNumber && phoneDisplay ? `${label ?? t("call")} ${phoneDisplay}` : (label ?? t("call"));
  return (
    <Button
      href={`tel:${phone}`}
      variant={variant}
      size={size}
      className={className}
      onClick={() => track("click_phone", placement)}
    >
      <Icon name="Phone" className="size-5 shrink-0" />
      <span className="truncate">{text}</span>
    </Button>
  );
}

export function WhatsAppButton({
  whatsapp,
  placement,
  label,
  variant = "secondary",
  size = "md",
  className,
}: Base & { whatsapp: string }) {
  const t = useTranslations("Site.actions");
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  return (
    <Button
      href={`https://wa.me/${digits}?text=${encodeURIComponent(t("whatsappText"))}`}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      className={className}
      onClick={() => track("click_whatsapp", placement)}
    >
      <Icon name="MessageCircle" className="size-5 shrink-0" />
      <span className="truncate">{label ?? t("whatsapp")}</span>
    </Button>
  );
}

export function DirectionsButton({
  mapsUrl,
  placement,
  label,
  variant = "ghost",
  size = "md",
  className,
}: Base & { mapsUrl: string }) {
  const t = useTranslations("Site.actions");
  return (
    <Button
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      className={className}
      onClick={() => track("click_maps", placement)}
    >
      <Icon name="MapPin" className="size-5 shrink-0" />
      <span className="truncate">{label ?? t("directions")}</span>
    </Button>
  );
}

export function EmailLink({ email, placement, className }: { email: string; placement: Placement; className?: string }) {
  if (!email) return null;
  return (
    <a href={`mailto:${email}`} className={className} onClick={() => track("click_email", placement)}>
      {email}
    </a>
  );
}
