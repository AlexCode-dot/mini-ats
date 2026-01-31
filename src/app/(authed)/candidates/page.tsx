import { requireRole } from "@/core/auth/requireRole";
import CustomerCandidatesView from "@/features/customerAts/components/CustomerCandidatesView/CustomerCandidatesView";

export default async function CandidatesPage() {
  await requireRole(["customer"]);

  return <CustomerCandidatesView />;
}
