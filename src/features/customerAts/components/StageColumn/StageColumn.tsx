"use client";

import { useDroppable } from "@dnd-kit/core";

import type { CustomerStage } from "@/features/customerAts/types";
import styles from "@/features/customerAts/components/StageColumn/StageColumn.module.scss";

type StageColumnProps = {
  stage: CustomerStage;
  count: number;
  children: React.ReactNode;
};

export default function StageColumn({
  stage,
  count,
  children,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.over : ""}`}
    >
      <div className={styles.header}>
        <span>{stage.name}</span>
        <span className={styles.count}>{count}</span>
      </div>
      <div className={styles.list}>{children}</div>
    </div>
  );
}
