import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getRawContent } from "@/lib/content";
import { locales } from "@/i18n/routing";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Content" };

async function Content({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  await requireAdmin();
  const { t } = await getAdminT();
  const q = (await searchParams).locale;
  const initialLocale = (locales as readonly string[]).includes(q ?? "") ? (q as "ro" | "en" | "it") : "ro";
  const all = await Promise.all(locales.map(async (l) => [l, await getRawContent(l)] as const));
  return (
    <>
      <PageTitle title={t("content.title")} sub={t("content.sub")} />
      <ContentEditor initial={Object.fromEntries(all) as never} initialLocale={initialLocale} />
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  return <Suspense fallback={null}><Content searchParams={searchParams} /></Suspense>;
}
