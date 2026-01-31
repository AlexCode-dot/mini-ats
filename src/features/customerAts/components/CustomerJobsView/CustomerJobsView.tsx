"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/shared/components/Button/Button";
import InlineError from "@/shared/components/InlineError/InlineError";
import TableCard from "@/shared/components/TableCard/TableCard";
import ConfirmDialog from "@/shared/components/ConfirmDialog/ConfirmDialog";
import Badge from "@/shared/components/Badge/Badge";
import CustomerShell from "@/features/customerAts/components/CustomerShell/CustomerShell";
import JobModal from "@/features/customerAts/components/JobModal/JobModal";
import JobDetailsModal from "@/features/customerAts/components/JobDetailsModal/JobDetailsModal";
import { useCustomerOrgName } from "@/features/customerAts/hooks/useCustomerOrgName";
import { useCustomerBoard } from "@/features/customerAts/hooks/useCustomerBoard";
import {
  createJob,
  deleteJob,
  updateJob,
} from "@/features/customerAts/services/customerAtsClient";
import type { CustomerJob } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/CustomerJobsView/CustomerJobsView.module.scss";

export default function CustomerJobsView() {
  const { jobs, candidates, isLoading, error, refresh } = useCustomerBoard();
  const { orgName, error: orgError } = useCustomerOrgName();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CustomerJob | null>(null);
  const [detailsJob, setDetailsJob] = useState<CustomerJob | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CustomerJob | null>(null);
  const [menuJobId, setMenuJobId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const jobCount = useMemo(() => jobs.length, [jobs.length]);
  const jobCandidateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((candidate) => {
      if (!candidate.job_id) return;
      counts.set(candidate.job_id, (counts.get(candidate.job_id) ?? 0) + 1);
    });
    return counts;
  }, [candidates]);

  const openCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const openEdit = (job: CustomerJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const openDetails = (job: CustomerJob) => {
    setDetailsJob(job);
    setIsDetailsOpen(true);
  };

  const handleSave = async (payload: {
    title: string;
    status: string;
    jobUrl: string | null;
  }) => {
    setActionError(null);
    if (editingJob) {
      await updateJob(editingJob.id, payload);
    } else {
      await createJob(payload);
    }
    await refresh();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setActionError(null);
    try {
      await deleteJob(pendingDelete.id);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete job"
      );
    } finally {
      setPendingDelete(null);
    }
  };

  useEffect(() => {
    if (!menuJobId) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-job-menu="true"]')) {
        return;
      }
      setMenuJobId(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuJobId]);

  const getJobLink = (jobUrl: string | null) => {
    if (!jobUrl) return null;
    if (!/^https?:\/\//i.test(jobUrl)) return null;
    return jobUrl;
  };

  useEffect(() => {
    if (!detailsJob) return;
    const fresh = jobs.find((job) => job.id === detailsJob.id) ?? null;
    setDetailsJob(fresh);
  }, [detailsJob?.id, jobs]);

  return (
    <CustomerShell orgName={orgName}>
      <div className={styles.page}>
        <InlineError message={orgError} />
        <div className={styles.mobileAction}>
          <Button startIcon="+" onClick={openCreate}>
            Create Job
          </Button>
        </div>

        <div className={styles.headerRow}>
          <h2>Jobs</h2>
          <Button startIcon="+" onClick={openCreate}>
            Create Job
          </Button>
        </div>

        <InlineError message={error || actionError} />
        {isLoading ? (
          <div className={styles.loading}>Loading jobs...</div>
        ) : null}
        {!isLoading ? (
          <TableCard title={`Jobs (${jobCount})`}>
            {jobs.length === 0 ? (
              <div className={styles.empty}>No jobs yet.</div>
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
                    {jobs.map((job) => (
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
                            const jobLink = getJobLink(job.job_url);
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
                        <td>{job.created_at.slice(0, 10)}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <Button
                              type="button"
                              size="sm"
                              className={styles.actionPrimary}
                              onClick={() => openDetails(job)}
                            >
                              Open
                            </Button>
                            <div className={styles.menu} data-job-menu="true">
                              <button
                                type="button"
                                className={styles.menuButton}
                                onClick={() =>
                                  setMenuJobId((prev) =>
                                    prev === job.id ? null : job.id
                                  )
                                }
                              >
                                ⋯
                              </button>
                              {menuJobId === job.id ? (
                                <div className={styles.menuDropdown}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      setMenuJobId(null);
                                      openEdit(job);
                                    }}
                                    className={styles.menuItem}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      setMenuJobId(null);
                                      setPendingDelete(job);
                                    }}
                                    className={styles.menuItem}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.mobileList}>
                  {jobs.map((job) => (
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
                          const jobLink = getJobLink(job.job_url);
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
                          onClick={() => openDetails(job)}
                        >
                          Open
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => openEdit(job)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => setPendingDelete(job)}
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
        ) : null}

        <JobModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          job={editingJob}
        />
        <JobDetailsModal
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          job={detailsJob}
          onEdit={(job) => {
            setIsDetailsOpen(false);
            openEdit(job);
          }}
          onDelete={(job) => {
            setIsDetailsOpen(false);
            setPendingDelete(job);
          }}
        />
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Delete job?"
          message={
            pendingDelete
              ? `${jobCandidateCounts.get(pendingDelete.id) ?? 0} candidate${(jobCandidateCounts.get(pendingDelete.id) ?? 0) === 1 ? "" : "s"} are linked to this job. Deleting it will detach them.`
              : "Deleting a job will remove it from the list and detach it from any candidates."
          }
          confirmLabel="Delete job"
          confirmText={
            pendingDelete && (jobCandidateCounts.get(pendingDelete.id) ?? 0) > 0
              ? "DELETE"
              : undefined
          }
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      </div>
    </CustomerShell>
  );
}
