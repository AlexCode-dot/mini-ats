import { requireRole } from "@/core/auth/requireRole";
import CustomerContextView from "@/features/adminConsole/components/CustomerContextView/CustomerContextView";
import CustomerJobsView from "@/features/customerAts/components/CustomerJobsView/CustomerJobsView";

export default async function AdminCustomerJobsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["admin"]);

  const { orgId } = await params;

  return (
    <CustomerContextView orgId={orgId} view="jobs">
      <CustomerJobsView mode="admin" orgId={orgId} wrapInShell={false} />
    </CustomerContextView>
  );
}
