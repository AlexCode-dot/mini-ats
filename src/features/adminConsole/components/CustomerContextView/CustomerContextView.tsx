"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CustomerContextBanner from "@/features/adminConsole/components/CustomerContextBanner/CustomerContextBanner";
import { useAdminOrganizations } from "@/features/adminConsole/hooks/useAdminOrganizations";
import styles from "@/features/adminConsole/components/CustomerContextView/CustomerContextView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";

type CustomerContextViewProps = {
  orgId: string;
  view: "candidates" | "jobs";
  children?: ReactNode;
};

export default function CustomerContextView({
  orgId,
  view,
  children,
}: CustomerContextViewProps) {
  const router = useRouter();
  const { state, data } = useAdminOrganizations();
  const activeOrg = data.organizations.find((org) => org.id === orgId);
  const orgName = activeOrg?.name ?? "Customer";

  const handleSwitchOrg = (nextOrgId: string) => {
    router.push(`/admin/customers/${nextOrgId}/${view}`);
  };

  const handleExit = () => {
    router.push("/admin/customers");
  };

  return (
    <AdminShell title={view === "candidates" ? "Candidates" : "Jobs"}>
      <div className={styles.page}>
        <InlineError message={state.error} />
        {state.isLoading ? <div>Loading...</div> : null}
        {!state.isLoading && data.organizations.length ? (
          <CustomerContextBanner
            orgId={orgId}
            orgName={orgName}
            organizations={data.organizations}
            onSwitchOrg={handleSwitchOrg}
            onExit={handleExit}
          />
        ) : null}

        <div className={styles.tabs}>
          <Link
            className={`${styles.tabLink} ${view === "candidates" ? styles.activeTab : ""}`}
            href={`/admin/customers/${orgId}/candidates`}
          >
            Candidates
          </Link>
          <Link
            className={`${styles.tabLink} ${view === "jobs" ? styles.activeTab : ""}`}
            href={`/admin/customers/${orgId}/jobs`}
          >
            Jobs
          </Link>
        </div>

        {children ? (
          children
        ) : (
          <div className={styles.emptyState}>
            Select a view to manage this customer.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
