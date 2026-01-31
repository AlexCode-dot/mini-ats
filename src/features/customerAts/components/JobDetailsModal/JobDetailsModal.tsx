"use client";

import { useEffect, useState } from "react";

import Badge from "@/shared/components/Badge/Badge";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import type { CustomerJob } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/JobDetailsModal/JobDetailsModal.module.scss";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

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
  const link =
    job.job_url && /^https?:\/\//i.test(job.job_url) ? job.job_url : null;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-job-details-menu="true"]')) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Job details</h3>
        <div className={styles.menu} data-job-details-menu="true">
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Job actions"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className={styles.menuDropdown}>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(job);
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
                  setMenuOpen(false);
                  onDelete(job);
                }}
                className={styles.menuItem}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </div>
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
