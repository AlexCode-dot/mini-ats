"use client";

import { useEffect, useState } from "react";

import Badge from "@/shared/components/Badge/Badge";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import type { CustomerCandidate } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/CandidateDetailsModal/CandidateDetailsModal.module.scss";

function isHttpUrl(value: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

type CandidateDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  candidate: CustomerCandidate | null;
  onEdit: (candidate: CustomerCandidate) => void;
  onArchive: (candidate: CustomerCandidate) => void;
};

export default function CandidateDetailsModal({
  open,
  onClose,
  candidate,
  onEdit,
  onArchive,
}: CandidateDetailsModalProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!candidate) {
      setMenuOpen(false);
      return;
    }
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-candidate-details-menu="true"]')) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!candidate) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Candidate details</h3>
        <div className={styles.menu} data-candidate-details-menu="true">
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Candidate actions"
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
                  onEdit(candidate);
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
                  onArchive(candidate);
                }}
                className={styles.menuItem}
              >
                Archive
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{candidate.name}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Job</span>
          {candidate.job_title ? (
            <span className={styles.value}>{candidate.job_title}</span>
          ) : (
            <Badge variant="inactive">No job linked</Badge>
          )}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          {candidate.email ? (
            <span className={styles.value}>{candidate.email}</span>
          ) : (
            <span className={styles.valueMuted}>No email</span>
          )}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>LinkedIn</span>
          {candidate.linkedin_url ? (
            isHttpUrl(candidate.linkedin_url) ? (
              <a
                className={styles.link}
                href={candidate.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open profile
              </a>
            ) : (
              <span className={styles.value}>{candidate.linkedin_url}</span>
            )
          ) : (
            <span className={styles.valueMuted}>No link</span>
          )}
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
