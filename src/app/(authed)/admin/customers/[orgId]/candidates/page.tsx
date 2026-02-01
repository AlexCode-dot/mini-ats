import { requireRole } from "@/core/auth/requireRole";
import CustomerContextView from "@/features/adminConsole/components/CustomerContextView/CustomerContextView";
import CustomerCandidatesView from "@/features/customerAts/components/CustomerCandidatesView/CustomerCandidatesView";

export default async function AdminCustomerCandidatesPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  await requireRole(["admin"]);

  const { orgId } = await params;

  return (
    <CustomerContextView orgId={orgId} view="candidates">
      <CustomerCandidatesView mode="admin" orgId={orgId} wrapInShell={false} />
    </CustomerContextView>
  );
}
