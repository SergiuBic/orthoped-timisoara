import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { KnowledgeManager } from "@/components/admin/knowledge-manager";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Knowledge" };

async function Content() {
  await requireAdmin();
  const { t } = await getAdminT();
  const rows = await db.select().from(schema.knowledgeFiles).orderBy(desc(schema.knowledgeFiles.createdAt));
  return (
    <>
      <PageTitle title={t("knowledge.title")} sub={t("knowledge.sub")} />
      <KnowledgeManager initial={rows.map((r) => ({ id: r.id, filename: r.filename, size: r.size, status: r.status, error: r.error, chunkCount: r.chunkCount, createdAt: r.createdAt.toISOString() }))} />
    </>
  );
}
export default function Page() {
  return <Suspense fallback={null}><Content /></Suspense>;
}
