import { requireRole } from "@/core/auth/requireRole";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return <main>Admin Dashboard</main>;
}
