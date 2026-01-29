import { requireRole } from "@/core/auth/requireRole";
import AdminCustomersView from "@/features/adminConsole/components/AdminCustomersView/AdminCustomersView";

export default async function AdminCustomersPage() {
  await requireRole(["admin"]);

  return <AdminCustomersView />;
}
