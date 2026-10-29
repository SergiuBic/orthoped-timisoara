import {
  Activity,
  ArrowRight,
  Award,
  Bandage,
  Bone,
  CalendarCheck,
  ChevronDown,
  Clock,
  Dumbbell,
  Footprints,
  Hand,
  HeartPulse,
  Hospital,
  Languages,
  MapPin,
  Menu,
  MessageCircle,
  PersonStanding,
  Phone,
  Scan,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  X,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  Bone,
  Activity,
  Footprints,
  HeartPulse,
  Stethoscope,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Languages,
  Syringe,
  Scan,
  Dumbbell,
  CalendarCheck,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Hospital,
  PersonStanding,
  Hand,
  Bandage,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = Object.hasOwn(ICONS, name) ? ICONS[name as IconName] : Sparkles;
  return <Cmp aria-hidden="true" {...props} />;
}
