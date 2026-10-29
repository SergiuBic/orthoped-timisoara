import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Icon } from "@/components/ui/icon";
import type { ContentOf } from "@/lib/content/types";

type Item = ContentOf<"services">["items"][number];

export function ServiceCard({ item }: { item: Item }) {
  return (
    <GlassCard
      as="article"
      className="group relative flex h-full flex-col gap-3 transition-transform duration-200 hover:-translate-y-1"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-peach text-navy">
        <Icon name={item.icon} className="size-6" />
      </span>
      <h3 className="font-display text-xl font-semibold tracking-tight">
        <Link
          href={{ pathname: "/services/[slug]", params: { slug: item.slug } }}
          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy dark:focus-visible:outline-peach"
        >
          {item.title}
        </Link>
      </h3>
      <p className="text-muted">{item.summary}</p>
      <Icon name="ArrowRight" className="mt-auto size-5 text-peach-deep transition-transform group-hover:translate-x-1" />
    </GlassCard>
  );
}
