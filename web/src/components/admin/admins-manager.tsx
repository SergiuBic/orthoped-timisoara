"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2, UserPlus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { addAdminAction, removeAdminAction } from "@/app/admin/(panel)/admins/actions";
import { SmallBtn, TextField } from "./fields";
import { useToast } from "./toast";

export function AdminsManager({ me, owners, admins }: { me: string; owners: string[]; admins: { email: string; addedBy: string | null }[] }) {
  const t = useTranslations("Admin.admins");
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const err = (e: string) => (e === "invalid_email" ? t("invalidEmail") : e === "self" ? t("cannotSelf") : e === "owner" ? t("cannotOwner") : e);

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3 p-5">
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await addAdminAction(email);
            if (r.ok) { setEmail(""); toast("ok", t("added")); router.refresh(); } else toast("error", err(r.error));
          });
        }}>
          <TextField label={t("email")} type="email" required value={email} onChange={setEmail} className="min-w-64 flex-1" placeholder="name@gmail.com" />
          <SmallBtn type="submit" disabled={pending} className="min-h-11 px-5"><UserPlus className="size-4" aria-hidden />{t("add")}</SmallBtn>
        </form>
        <p className="rounded-xl bg-peach/30 p-3 text-sm">{t("hint")}</p>
      </GlassCard>
      <GlassCard className="p-4 md:p-5">
        <ul className="divide-y divide-navy/5">
          {owners.map((o) => (
            <li key={o} className="flex min-h-12 items-center justify-between gap-2 py-2 text-sm">
              <span className="break-all">{o}</span>
              <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-semibold text-cloud dark:bg-cloud dark:text-navy">{t("owner")}</span>
            </li>
          ))}
          {admins.map((a) => (
            <li key={a.email} className="flex min-h-12 items-center justify-between gap-2 py-2 text-sm">
              <span className="break-all">{a.email}{a.email === me && <span className="ml-2 text-xs text-muted">({t("you")})</span>}
                {a.addedBy && <span className="block text-xs text-muted">{t("addedBy", { email: a.addedBy })}</span>}</span>
              <SmallBtn aria-label={t("remove")} disabled={a.email === me || pending}
                onClick={() => { if (window.confirm(t("removeConfirm", { email: a.email }))) start(async () => { const r = await removeAdminAction(a.email); if (r.ok) { toast("ok", t("removed")); router.refresh(); } else toast("error", err(r.error)); }); }}>
                <Trash2 className="size-4" />
              </SmallBtn>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
