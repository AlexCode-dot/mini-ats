"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminShell from "@/features/adminConsole/components/AdminShell/AdminShell";
import CustomerContextBanner from "@/features/adminConsole/components/CustomerContextBanner/CustomerContextBanner";
import { useAdminCustomerContext } from "@/features/adminConsole/hooks/useAdminCustomerContext";
import { useAdminOrganizations } from "@/features/adminConsole/hooks/useAdminOrganizations";
import styles from "@/features/adminConsole/components/CustomerContextView/CustomerContextView.module.scss";
import InlineError from "@/shared/components/InlineError/InlineError";
import Button from "@/shared/components/Button/Button";

type CustomerContextViewProps = {
  orgId: string;
  view: "candidates" | "jobs";
};

export default function CustomerContextView({
  orgId,
  view,
}: CustomerContextViewProps) {
  const router = useRouter();
  const { organizations, isLoading, error } = useAdminOrganizations();
  const customerContext = useAdminCustomerContext(orgId, view);
  const activeOrg = organizations.find((org) => org.id === orgId);
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
        <InlineError message={error} />
        {isLoading ? <div>Loading...</div> : null}
        {!isLoading && organizations.length ? (
          <CustomerContextBanner
            orgId={orgId}
            orgName={orgName}
            organizations={organizations}
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

        <div className={styles.headerRow}>
          <h2>{view === "candidates" ? "Candidates" : "Jobs"}</h2>
          <Button type="button" startIcon="+">
            {view === "candidates" ? "Add Candidate" : "Create Job"}
          </Button>
        </div>

        <InlineError message={customerContext.error} />
        {customerContext.isLoading ? <div>Loading customer data...</div> : null}
        {!customerContext.isLoading && view === "candidates" ? (
          <div className={styles.kanban}>
            {(customerContext.candidates?.stages ?? []).map((stage) => {
              const cards = (
                customerContext.candidates?.candidates ?? []
              ).filter((candidate) => candidate.stage_id === stage.id);

              return (
                <div key={stage.id} className={styles.column}>
                  <div className={styles.columnTitle}>{stage.name}</div>
                  {cards.length === 0 ? (
                    <div className={styles.card}>No candidates</div>
                  ) : null}
                  {cards.map((candidate) => (
                    <div className={styles.card} key={candidate.id}>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.job_title ?? "—"}</span>
                      <span>{candidate.email ?? "—"}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : null}
        {!customerContext.isLoading && view === "jobs" ? (
          <div className={styles.jobsPlaceholder}>
            {customerContext.jobs.length === 0 ? (
              <div>No jobs yet.</div>
            ) : (
              customerContext.jobs.map((job) => (
                <div key={job.id} className={styles.card}>
                  <strong>{job.title}</strong>
                  <span>{job.status ?? "—"}</span>
                  <span>{job.created_at.slice(0, 10)}</span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
