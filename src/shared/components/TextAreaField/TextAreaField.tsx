import type { TextareaHTMLAttributes } from "react";

import styles from "@/shared/components/TextAreaField/TextAreaField.module.scss";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export default function TextAreaField({ label, ...props }: TextAreaFieldProps) {
  return (
    <label className={styles.field}>
      {label}
      <textarea {...props} />
    </label>
  );
}
