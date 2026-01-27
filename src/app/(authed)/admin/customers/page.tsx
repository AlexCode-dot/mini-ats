import { requireRole } from "@/core/auth/requireRole";

export default async function AdminCustomersPage() {
  await requireRole(["admin"]);

  return <main>Admin: Customers</main>;
}
