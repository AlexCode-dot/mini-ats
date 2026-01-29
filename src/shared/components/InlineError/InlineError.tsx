import styles from "@/shared/components/InlineError/InlineError.module.scss";

type InlineErrorProps = {
  message?: string | null;
};

export default function InlineError({ message }: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return <div className={styles.error}>{message}</div>;
}
