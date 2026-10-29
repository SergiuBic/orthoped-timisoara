import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getAiSettings } from "@/lib/content";
import { AiForm } from "@/components/admin/ai-form";
import { Playground } from "@/components/admin/playground";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "AI Assistant" };

async function Content() {
  await requireAdmin();
  const { t } = await getAdminT();
  const ai = await getAiSettings();
  return (
    <>
      <PageTitle title={t("ai.title")} />
      <div className="grid gap-4 xl:grid-cols-2">
        <AiForm initial={ai} />
        <Playground />
      </div>
    </>
  );
}
export default function Page() {
  return <Suspense fallback={null}><Content /></Suspense>;
}
