import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

import styles from "@/shared/components/LinkButton/LinkButton.module.scss";

type LinkButtonVariant = "primary" | "secondary";

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: LinkButtonVariant;
};

export default function LinkButton({
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={[styles.button, styles[variant], className ?? ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
