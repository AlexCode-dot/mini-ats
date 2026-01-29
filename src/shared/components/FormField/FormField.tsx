import type { InputHTMLAttributes } from "react";

import styles from "@/shared/components/FormField/FormField.module.scss";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function FormField({ label, ...props }: FormFieldProps) {
  return (
    <label className={styles.field}>
      {label}
      <input {...props} />
    </label>
  );
}
