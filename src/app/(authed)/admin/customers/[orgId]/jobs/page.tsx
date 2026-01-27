import { requireRole } from "@/core/auth/requireRole";

export default async function AdminCustomerJobsPage() {
  await requireRole(["admin"]);

  return <main>Admin: Customer Jobs</main>;
}
