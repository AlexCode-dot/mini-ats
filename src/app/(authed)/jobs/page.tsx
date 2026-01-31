import { requireRole } from "@/core/auth/requireRole";
import CustomerJobsView from "@/features/customerAts/components/CustomerJobsView/CustomerJobsView";

export default async function JobsPage() {
  await requireRole(["customer"]);

  return <CustomerJobsView />;
}
