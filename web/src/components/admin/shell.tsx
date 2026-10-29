"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3, Bot, FileText, ImageIcon, Inbox, Library, LogOut, MapPin, MessagesSquare, ShieldCheck, ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { setAdminLocale } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", key: "overview", Icon: BarChart3 },
  { href: "/admin/settings", key: "settings", Icon: MapPin },
  { href: "/admin/content", key: "content", Icon: FileText },
  { href: "/admin/media", key: "media", Icon: ImageIcon },
  { href: "/admin/ai", key: "ai", Icon: Bot },
  { href: "/admin/knowledge", key: "knowledge", Icon: Library },
  { href: "/admin/leads", key: "leads", Icon: Inbox },
  { href: "/admin/conversations", key: "conversations", Icon: MessagesSquare },
  { href: "/admin/admins", key: "admins", Icon: ShieldCheck },
] as const;

export function Sidebar({ newLeads }: { newLeads: number }) {
  const t = useTranslations("Admin.nav");
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <>
      <aside className="glass fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-3xl p-4 md:flex">
        <div className="mb-6 px-2 pt-2 font-display text-xl font-semibold">Ortoped<span className="text-peach-deep"> Admin</span></div>
        <nav aria-label={t("label")} className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map(({ href, key, Icon }) => (
            <Link
              key={key}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors outline-2 outline-offset-2 outline-transparent focus-visible:outline-navy dark:focus-visible:outline-peach",
                active(href) ? "bg-peach text-navy" : "hover:bg-white/50 dark:hover:bg-white/10",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1">{t(key)}</span>
              {key === "leads" && newLeads > 0 && (
                <span className="rounded-full bg-navy px-2 py-0.5 text-xs text-cloud dark:bg-cloud dark:text-navy">{newLeads}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <nav
        aria-label={t("label")}
        className="glass fixed inset-x-2 bottom-2 z-30 flex overflow-x-auto rounded-3xl p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {NAV.map(({ href, key, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-label={t(key)}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "relative flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-medium",
              active(href) ? "bg-peach text-navy" : "",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="max-w-14 truncate">{t(key)}</span>
            {key === "leads" && newLeads > 0 && (
              <span className="absolute top-0.5 right-1 rounded-full bg-danger px-1.5 text-[10px] text-white">{newLeads}</span>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function TopBar({ locale, name, image }: { locale: string; name: string; image: string | null }) {
  const t = useTranslations("Admin.top");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <header className="flex items-center justify-between gap-2 px-1 py-3">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-white/50 dark:hover:bg-white/10"
      >
        {t("viewSite")} <ExternalLink className="size-4" aria-hidden />
      </a>
      <div className="flex items-center gap-2">
        <div role="group" aria-label={t("language")} className="glass flex rounded-full p-0.5">
          {(["it", "en", "ro"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === locale}
              disabled={pending}
              onClick={() => start(async () => { await setAdminLocale(l); router.refresh(); })}
              className={cn("min-h-9 min-w-9 rounded-full px-2 text-xs font-semibold uppercase", l === locale ? "bg-navy text-cloud dark:bg-cloud dark:text-navy" : "")}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="hidden items-center gap-2 sm:flex" title={name}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="size-9 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-peach font-semibold text-navy">{name.slice(0, 1).toUpperCase()}</span>
          )}
        </span>
        <button
          type="button"
          aria-label={t("logout")}
          title={t("logout")}
          onClick={async () => { await authClient.signOut(); router.push("/admin/login"); router.refresh(); }}
          className="glass grid size-11 place-items-center rounded-full"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
