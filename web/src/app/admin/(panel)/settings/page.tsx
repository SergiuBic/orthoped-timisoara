import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getRawContent, getSettings } from "@/lib/content";
import { locales } from "@/i18n/routing";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Contact & SEO" };

async function Content() {
  await requireAdmin();
  const { t } = await getAdminT();
  const [settings, raws] = await Promise.all([
    getSettings(),
    Promise.all(locales.map(async (l) => [l, (await getRawContent(l)).seo] as const)),
  ]);
  return (
    <>
      <PageTitle title={t("settings.title")} sub={t("settings.sub")} />
      <SettingsForm initial={settings} seo={Object.fromEntries(raws)} />
    </>
  );
}
export default function Page() {
  return <Suspense fallback={null}><Content /></Suspense>;
}
