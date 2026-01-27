import { requireRole } from "@/core/auth/requireRole";

export default async function AdminsPage() {
  await requireRole(["admin"]);

  return <main>Admin: Admins</main>;
}
