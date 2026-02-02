"use client";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import TableCard from "@/shared/components/TableCard/TableCard";
import ConfirmDialog from "@/shared/components/ConfirmDialog/ConfirmDialog";
import Badge from "@/shared/components/Badge/Badge";
import CustomerShell from "@/features/customerAts/components/CustomerShell/CustomerShell";
import JobModal from "@/features/customerAts/components/JobModal/JobModal";
import JobDetailsModal from "@/features/customerAts/components/JobDetailsModal/JobDetailsModal";
import ActionMenu from "@/shared/components/ActionMenu/ActionMenu";
import ScrollArea from "@/shared/components/ScrollArea/ScrollArea";
import { formatDate } from "@/shared/utils/formatDate";
import { normalizeJobLink } from "@/shared/utils/urlHelpers";
import { useCustomerJobsView } from "@/features/customerAts/hooks/useCustomerJobsView";
import styles from "@/features/customerAts/components/CustomerJobsView/CustomerJobsView.module.scss";

type CustomerJobsViewProps = {
  mode?: "customer" | "admin";
  orgId?: string;
  basePath?: string;
  contextLabel?: string;
  wrapInShell?: boolean;
};

export default function CustomerJobsView({
  mode = "customer",
  orgId,
  basePath,
  contextLabel,
  wrapInShell = true,
}: CustomerJobsViewProps) {
  const { state, data, modals, actions } = useCustomerJobsView({ mode, orgId });

  const content = (
    <div className={styles.page}>
      <InlineError message={state.orgError} />
      <div className={styles.mobileAction}>
        <Button startIcon="+" onClick={actions.openCreate}>
          Create Job
        </Button>
      </div>

      <div className={styles.headerRow}>
        <h2>Jobs</h2>
        <Button startIcon="+" onClick={actions.openCreate}>
          Create Job
        </Button>
      </div>

      <InlineError message={state.error || state.actionError} />
      {state.isLoading ? (
        <div className={styles.loading}>Loading jobs...</div>
      ) : null}
      {!state.isLoading ? (
        <ScrollArea className={styles.listScroll} orientation="y">
          <TableCard title={`Jobs (${data.jobCount})`}>
            {data.jobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No jobs yet</div>
                <div className={styles.emptyText}>
                  Create your first job to start tracking candidates.
                </div>
                <Button
                  type="button"
                  startIcon="+"
                  onClick={actions.openCreate}
                >
                  Create Job
                </Button>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Job link</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.jobs.map((job) => (
                      <tr key={job.id}>
                        <td className={styles.jobTitle}>{job.title}</td>
                        <td>
                          <Badge
                            variant={
                              job.status === "closed" ? "inactive" : "active"
                            }
                          >
                            {job.status === "closed" ? "Closed" : "Open"}
                          </Badge>
                        </td>
                        <td>
                          {(() => {
                            const jobLink = normalizeJobLink(job.job_url);
                            return jobLink ? (
                              <a
                                className={styles.jobLink}
                                href={jobLink}
                                target="_blank"
                                rel="noreferrer noopener"
                              >
                                Open listing
                              </a>
                            ) : (
                              "No link"
                            );
                          })()}
                        </td>
                        <td>{formatDate(job.created_at)}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <Button
                              type="button"
                              size="sm"
                              className={styles.actionPrimary}
                              onClick={() => actions.openDetails(job)}
                            >
                              Open
                            </Button>
                            <ActionMenu
                              items={[
                                {
                                  label: "Edit",
                                  onClick: () => actions.openEdit(job),
                                },
                                {
                                  label: "Delete",
                                  onClick: () => actions.confirmDelete(job),
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.mobileList}>
                  {data.jobs.map((job) => (
                    <div className={styles.card} key={job.id}>
                      <div className={styles.cardTitle}>{job.title}</div>
                      <Badge
                        variant={
                          job.status === "closed" ? "inactive" : "active"
                        }
                      >
                        {job.status === "closed" ? "Closed" : "Open"}
                      </Badge>
                      <div className={styles.cardMeta}>
                        <span>{job.created_at.slice(0, 10)}</span>
                        {(() => {
                          const jobLink = normalizeJobLink(job.job_url);
                          return jobLink ? (
                            <a
                              className={styles.jobLink}
                              href={jobLink}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              Open listing
                            </a>
                          ) : null;
                        })()}
                      </div>
                      <div className={styles.mobileActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => actions.openDetails(job)}
                        >
                          Open
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => actions.openEdit(job)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => actions.confirmDelete(job)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TableCard>
        </ScrollArea>
      ) : null}

      <JobModal
        open={modals.isModalOpen}
        onClose={actions.closeModal}
        onSave={actions.handleSave}
        job={modals.editingJob}
      />
      <JobDetailsModal
        open={modals.isDetailsOpen}
        onClose={actions.closeDetails}
        job={modals.detailsJob}
        onEdit={(job) => {
          actions.closeDetails();
          actions.openEdit(job);
        }}
        onDelete={(job) => {
          actions.closeDetails();
          actions.confirmDelete(job);
        }}
      />
      <ConfirmDialog
        open={Boolean(modals.pendingDelete)}
        title="Delete job?"
        message={
          modals.pendingDelete
            ? `${data.jobCandidateCounts.get(modals.pendingDelete.id) ?? 0} candidate${(data.jobCandidateCounts.get(modals.pendingDelete.id) ?? 0) === 1 ? "" : "s"} are linked to this job. Deleting it will detach them.`
            : "Deleting a job will remove it from the list and detach it from any candidates."
        }
        confirmLabel="Delete job"
        confirmText={
          modals.pendingDelete &&
          (data.jobCandidateCounts.get(modals.pendingDelete.id) ?? 0) > 0
            ? "DELETE"
            : undefined
        }
        onConfirm={actions.handleDelete}
        onCancel={actions.cancelDelete}
      />
    </div>
  );

  if (!wrapInShell) {
    return content;
  }

  return (
    <CustomerShell
      orgName={state.orgName}
      basePath={basePath}
      contextLabel={contextLabel}
    >
      {content}
    </CustomerShell>
  );
}
