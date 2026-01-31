import type { SelectHTMLAttributes } from "react";

import styles from "@/shared/components/SelectField/SelectField.module.scss";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export default function SelectField({
  label,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <label className={styles.field}>
      {label}
      <select {...props}>{children}</select>
    </label>
  );
}
