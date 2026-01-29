import { requireRole } from "@/core/auth/requireRole";
import AdminDashboardView from "@/features/adminConsole/components/AdminDashboardView/AdminDashboardView";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return <AdminDashboardView />;
}
