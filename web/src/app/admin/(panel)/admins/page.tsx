import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { requireAdmin, adminEmails } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { AdminsManager } from "@/components/admin/admins-manager";
import { PageTitle } from "@/components/admin/fields";
import { getAdminT } from "../../_lib/locale";

export const metadata = { title: "Admins" };

async function Content() {
  const session = await requireAdmin();
  const { t } = await getAdminT();
  const rows = await db.select().from(schema.adminAllowlist).orderBy(asc(schema.adminAllowlist.createdAt));
  return (
    <>
      <PageTitle title={t("admins.title")} sub={t("admins.sub")} />
      <AdminsManager
        me={session.user.email.toLowerCase()}
        owners={adminEmails()}
        admins={rows.map((r) => ({ email: r.email, addedBy: r.addedBy }))}
      />
    </>
  );
}
export default function Page() {
  return <Suspense fallback={null}><Content /></Suspense>;
}
