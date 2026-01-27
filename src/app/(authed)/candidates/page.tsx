import { requireRole } from "@/core/auth/requireRole";

export default async function CandidatesPage() {
  await requireRole(["customer"]);

  return <main>Protected: Candidates</main>;
}
