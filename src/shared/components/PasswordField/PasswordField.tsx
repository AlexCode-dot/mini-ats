import { useEffect, useRef, useState } from "react";

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
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

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
              setIsCopied(true);
              if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
              }
              copyTimeoutRef.current = window.setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }
          }}
        >
          {isCopied ? "Copied" : "Copy"}
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
