import type { ButtonHTMLAttributes } from "react";

import styles from "@/shared/components/Button/Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  startIcon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {startIcon ? <span className={styles.icon}>{startIcon}</span> : null}
      {props.children}
    </button>
  );
}
