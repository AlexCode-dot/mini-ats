import { requireRole } from "@/core/auth/requireRole";
import AdminAdminsView from "@/features/adminConsole/components/AdminAdminsView/AdminAdminsView";

export default async function AdminsPage() {
  await requireRole(["admin"]);

  return <AdminAdminsView />;
}
