"use client";

import { useEffect, useState } from "react";

import Badge from "@/shared/components/Badge/Badge";
import Button from "@/shared/components/Button/Button";
import Modal from "@/shared/components/Modal/Modal";
import ActionMenu from "@/shared/components/ActionMenu/ActionMenu";
import type { CustomerCandidate } from "@/features/customerAts/types";
import { isHttpUrl } from "@/shared/utils/urlHelpers";
import { getCandidateResumeUrl } from "@/features/customerAts/services/customerAtsClient";
import styles from "@/features/customerAts/components/CandidateDetailsModal/CandidateDetailsModal.module.scss";

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
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadResume = async () => {
      if (!candidate?.resume_url) {
        if (isMounted) {
          setResumeLink(null);
          setResumeError(null);
        }
        return;
      }

      if (isHttpUrl(candidate.resume_url)) {
        if (isMounted) {
          setResumeLink(candidate.resume_url);
          setResumeError(null);
        }
        return;
      }

      try {
        const url = await getCandidateResumeUrl(candidate.resume_url);
        if (isMounted) {
          setResumeLink(url);
          setResumeError(null);
        }
      } catch {
        if (isMounted) {
          setResumeLink(null);
          setResumeError("Resume unavailable");
        }
      }
    };

    void loadResume();

    return () => {
      isMounted = false;
    };
  }, [candidate]);

  if (!candidate) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Candidate details</h3>
        <ActionMenu
          items={[
            { label: "Edit", onClick: () => onEdit(candidate) },
            { label: "Archive", onClick: () => onArchive(candidate) },
          ]}
          ariaLabel="Candidate actions"
        />
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{candidate.name}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Job</span>
          {candidate.job_title ? (
            <span className={styles.jobRow}>
              <span className={styles.value}>{candidate.job_title}</span>
              {candidate.job_status === "closed" ? (
                <span className={styles.closedBadge}>Closed</span>
              ) : null}
            </span>
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
        <div className={styles.row}>
          <span className={styles.label}>Resume</span>
          {resumeLink ? (
            <a
              className={styles.link}
              href={resumeLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              Download resume
            </a>
          ) : resumeError ? (
            <span className={styles.valueMuted}>{resumeError}</span>
          ) : (
            <span className={styles.valueMuted}>No resume</span>
          )}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Note</span>
          {candidate.note ? (
            <span className={styles.valueMultiline}>{candidate.note}</span>
          ) : (
            <span className={styles.valueMuted}>No notes</span>
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
