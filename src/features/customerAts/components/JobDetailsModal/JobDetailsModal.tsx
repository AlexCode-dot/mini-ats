"use client";

import Badge from "@/shared/components/Badge/Badge";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import ActionMenu from "@/shared/components/ActionMenu/ActionMenu";
import type { CustomerJob } from "@/features/customerAts/types";
import { formatDate } from "@/shared/utils/formatDate";
import { normalizeJobLink } from "@/shared/utils/urlHelpers";
import styles from "@/features/customerAts/components/JobDetailsModal/JobDetailsModal.module.scss";

type JobDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  job: CustomerJob | null;
  onEdit: (job: CustomerJob) => void;
  onDelete: (job: CustomerJob) => void;
};

export default function JobDetailsModal({
  open,
  onClose,
  job,
  onEdit,
  onDelete,
}: JobDetailsModalProps) {
  if (!job) return null;
  const statusVariant = job.status === "closed" ? "inactive" : "active";
  const link = normalizeJobLink(job.job_url);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Job details</h3>
        <ActionMenu
          items={[
            { label: "Edit", onClick: () => onEdit(job) },
            { label: "Delete", onClick: () => onDelete(job) },
          ]}
          ariaLabel="Job actions"
        />
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Title</span>
          <span className={styles.value}>{job.title}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Status</span>
          <Badge variant={statusVariant}>
            {job.status === "closed" ? "Closed" : "Open"}
          </Badge>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Job link</span>
          {link ? (
            <a
              className={styles.link}
              href={link}
              target="_blank"
              rel="noreferrer noopener"
            >
              {link}
            </a>
          ) : (
            <span className={styles.valueMuted}>No link</span>
          )}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Created</span>
          <span className={styles.value}>{formatDate(job.created_at)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
