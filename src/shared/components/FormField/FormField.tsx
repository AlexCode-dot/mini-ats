import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "@/shared/components/FormField/FormField.module.scss";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  startIcon?: ReactNode;
};

export default function FormField({
  label,
  startIcon,
  className,
  ...props
}: FormFieldProps) {
  return (
    <label className={styles.field}>
      {label}
      <div className={styles.inputRow}>
        {startIcon ? <span className={styles.icon}>{startIcon}</span> : null}
        <input
          {...props}
          className={[styles.input, className ?? ""].filter(Boolean).join(" ")}
        />
      </div>
    </label>
  );
}
