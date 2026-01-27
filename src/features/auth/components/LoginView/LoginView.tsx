"use client";

import { useState } from "react";

import { useLogin } from "@/features/auth/hooks/useLogin";
import styles from "@/features/auth/components/LoginView/LoginView.module.scss";

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errorMessage, isLoading, handleLogin } = useLogin();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <main className={styles.root}>
      <h1>Sign in</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        {errorMessage ? (
          <p className={styles.error}>{errorMessage}</p>
        ) : null}
      </form>
    </main>
  );
}
