import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getSettings } from "@/lib/content";
import { MediaManager } from "@/components/admin/media-manager";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Media" };

async function Content() {
  await requireAdmin();
  const { t } = await getAdminT();
  const [rows, settings] = await Promise.all([db.select().from(schema.media).orderBy(desc(schema.media.createdAt)), getSettings()]);
  return (
    <>
      <PageTitle title={t("media.title")} sub={t("media.sub")} />
      <MediaManager
        doctorPhotoId={settings.doctorPhotoId}
        items={rows.map((r) => ({ id: r.id, filename: r.filename, width: r.width, height: r.height, alt: r.alt }))}
      />
    </>
  );
}
export default function Page() {
  return <Suspense fallback={null}><Content /></Suspense>;
}
