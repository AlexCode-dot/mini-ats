import { requireRole } from "@/core/auth/requireRole";

export default async function AdminCustomerCandidatesPage() {
  await requireRole(["admin"]);

  return <main>Admin: Customer Candidates</main>;
}
