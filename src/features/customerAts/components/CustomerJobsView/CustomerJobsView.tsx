"use client";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import TableCard from "@/shared/components/TableCard/TableCard";
import CustomerShell from "@/features/customerAts/components/CustomerShell/CustomerShell";
import { useCustomerOrgName } from "@/features/customerAts/hooks/useCustomerOrgName";
import { useCustomerBoard } from "@/features/customerAts/hooks/useCustomerBoard";
import styles from "@/features/customerAts/components/CustomerJobsView/CustomerJobsView.module.scss";

export default function CustomerJobsView() {
  const { jobs, isLoading, error } = useCustomerBoard();
  const { orgName, error: orgError } = useCustomerOrgName();

  return (
    <CustomerShell orgName={orgName}>
      <div className={styles.page}>
        <InlineError message={orgError} />
        <div className={styles.mobileAction}>
          <Button startIcon="+">Create Job</Button>
        </div>

        <div className={styles.headerRow}>
          <h2>Jobs</h2>
          <Button startIcon="+">Create Job</Button>
        </div>

        <InlineError message={error} />
        {isLoading ? (
          <div className={styles.loading}>Loading jobs...</div>
        ) : null}
        {!isLoading ? (
          <TableCard title="Jobs">
            {jobs.length === 0 ? (
              <div className={styles.empty}>No jobs yet.</div>
            ) : (
              <div className={styles.jobList}>
                {jobs.map((job) => (
                  <div key={job.id} className={styles.jobRow}>
                    <div className={styles.jobTitle}>{job.title}</div>
                    <div className={styles.jobMeta}>{job.status ?? "—"}</div>
                    <div className={styles.jobMeta}>
                      {job.created_at.slice(0, 10)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TableCard>
        ) : null}
      </div>
    </CustomerShell>
  );
}
