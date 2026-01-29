import { requireRole } from "@/core/auth/requireRole";
import CustomerContextView from "@/features/adminConsole/components/CustomerContextView/CustomerContextView";

export default async function AdminCustomerJobsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["admin"]);

  const { orgId } = await params;

  return <CustomerContextView orgId={orgId} view="jobs" />;
}
