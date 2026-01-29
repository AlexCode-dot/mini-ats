import type { ReactNode } from "react";

import styles from "@/shared/components/TableCard/TableCard.module.scss";

type TableCardProps = {
  title?: string;
  className?: string;
  children: ReactNode;
};

export default function TableCard({
  title,
  className,
  children,
}: TableCardProps) {
  return (
    <section
      className={[styles.card, className ?? ""].filter(Boolean).join(" ")}
    >
      {title ? <div className={styles.header}>{title}</div> : null}
      {children}
    </section>
  );
}
