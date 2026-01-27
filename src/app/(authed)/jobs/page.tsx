import { requireRole } from "@/core/auth/requireRole";

export default async function JobsPage() {
  await requireRole(["customer"]);

  return <main>Protected: Jobs</main>;
}
