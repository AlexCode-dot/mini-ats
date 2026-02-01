"use client";

import type { ReactNode } from "react";

import styles from "@/shared/components/ScrollArea/ScrollArea.module.scss";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  orientation?: "x" | "y" | "both";
};

export default function ScrollArea({
  children,
  className,
  orientation = "both",
}: ScrollAreaProps) {
  return (
    <div
      className={[
        styles.scrollArea,
        styles[`scroll${orientation.toUpperCase()}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
