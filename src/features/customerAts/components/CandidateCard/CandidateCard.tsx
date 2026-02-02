"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { CustomerCandidate } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/CandidateCard/CandidateCard.module.scss";

type CandidateCardProps = {
  candidate: CustomerCandidate;
  onOpen?: (candidate: CustomerCandidate) => void;
};

export default function CandidateCard({
  candidate,
  onOpen,
}: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: candidate.id,
      data: { stageId: candidate.stage_id },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(candidate)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.(candidate);
        }
      }}
    >
      <button
        type="button"
        className={styles.handle}
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        aria-label="Drag candidate"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="5" cy="4" r="1.2" />
          <circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>
      <div className={styles.name}>{candidate.name}</div>
      {candidate.job_title ? (
        <div className={styles.roleRow}>
          <span className={styles.role}>{candidate.job_title}</span>
          {candidate.job_status === "closed" ? (
            <span className={styles.closedBadge}>Closed</span>
          ) : null}
        </div>
      ) : (
        <div className={styles.warning}>
          <span className={styles.warningIcon} aria-hidden>
            !
          </span>
          No job linked
        </div>
      )}
      {candidate.email ? (
        <div className={styles.meta}>{candidate.email}</div>
      ) : (
        <div className={`${styles.meta} ${styles.placeholder}`}>
          No email
        </div>
      )}
    </div>
  );
}
