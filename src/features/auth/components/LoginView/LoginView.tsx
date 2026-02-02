"use client";

import { useEffect, useState } from "react";

import { useLogin } from "@/features/auth/hooks/useLogin";
import styles from "@/features/auth/components/LoginView/LoginView.module.scss";
import Button from "@/shared/components/Button/Button";
import FormField from "@/shared/components/FormField/FormField";

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    errorMessage,
    infoMessage,
    isLoading,
    isResetting,
    handleLogin,
    handlePasswordReset,
  } = useLogin();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleLogin(email, password);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) return;
    if (hash.includes("type=invite") || hash.includes("type=recovery")) {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <div className={styles.iconCircle} aria-hidden="true">
          <LockIcon />
        </div>
        <h1 className={styles.title}>ATS Login</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <FormField
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            startIcon={<MailIcon />}
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            startIcon={<LockIcon />}
            required
          />
          <button
            type="button"
            className={styles.forgot}
            onClick={() => handlePasswordReset(email)}
            disabled={isResetting}
          >
            {isResetting ? "Sending..." : "Forgot password?"}
          </button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
          {infoMessage ? <p className={styles.info}>{infoMessage}</p> : null}
        </form>
        <div className={styles.divider} />
        <div className={styles.footerLine}>Applicant Tracking System</div>
      </div>
    </main>
  );
}
