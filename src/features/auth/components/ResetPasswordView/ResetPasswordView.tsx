"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/shared/components/Button/Button";
import FormField from "@/shared/components/FormField/FormField";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import styles from "@/features/auth/components/ResetPasswordView/ResetPasswordView.module.scss";

export default function ResetPasswordView() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const {
    isReady,
    hasSession,
    errorMessage,
    successMessage,
    isSaving,
    handleReset,
  } = useResetPassword();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() !== confirm.trim()) {
      return;
    }
    await handleReset(password);
  };

  const mismatchError =
    password && confirm && password.trim() !== confirm.trim()
      ? "Passwords do not match."
      : null;

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = window.setTimeout(() => {
      router.push("/login");
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [router, successMessage]);

  if (!isReady) {
    return <main className={styles.root}>Loading...</main>;
  }

  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>
          {hasSession
            ? "Choose a new password for your account."
            : "Open the reset link from your email to continue."}
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <FormField
            label="Confirm password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
          {mismatchError ? (
            <p className={styles.error}>{mismatchError}</p>
          ) : null}
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
          {successMessage ? (
            <p className={styles.info}>{successMessage}</p>
          ) : null}
          <Button type="submit" disabled={isSaving || Boolean(mismatchError)}>
            {isSaving ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
