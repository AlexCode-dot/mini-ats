import type { ReactNode } from "react";

import styles from "@/shared/components/Badge/Badge.module.scss";

type BadgeVariant = "active" | "inactive";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export default function Badge({
  variant = "active",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        styles.badge,
        variant === "inactive" ? styles.inactive : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
