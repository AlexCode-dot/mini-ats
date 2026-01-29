import { useState } from "react";

import styles from "@/shared/components/PasswordField/PasswordField.module.scss";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => string;
  onCopy?: (value: string) => void;
  hint?: string;
  error?: string | null;
  required?: boolean;
};

export default function PasswordField({
  label,
  value,
  onChange,
  onGenerate,
  onCopy,
  hint,
  error: externalError,
  required = false,
}: PasswordFieldProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <label className={styles.field}>
      {label}
      <div className={styles.row}>
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
        <button
          type="button"
          className={styles.inlineButton}
          onClick={() => {
            const nextValue = onGenerate();
            if (!nextValue) {
              setError(
                "Secure password generation is unavailable. Please enter a password."
              );
              return;
            }
            setError(null);
            onChange(nextValue);
          }}
        >
          Generate
        </button>
        <button
          type="button"
          className={styles.inlineButton}
          onClick={() => {
            if (value) {
              onCopy?.(value);
            }
          }}
        >
          Copy
        </button>
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {externalError ? (
        <span className={styles.error}>{externalError}</span>
      ) : error ? (
        <span className={styles.error}>{error}</span>
      ) : null}
    </label>
  );
}
