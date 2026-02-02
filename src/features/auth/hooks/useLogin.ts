"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { sanitizeRedirectPath } from "@/core/security/sanitizeRedirect";
import {
  fetchUserRole,
  requestPasswordReset,
  signInWithPassword,
} from "@/features/auth/services/authClient";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error || !data.user) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      const { role, errorMessage: roleError } = await fetchUserRole(
        data.user.id
      );

      if (roleError) {
        setErrorMessage("Unable to load your account.");
        return;
      }

      const roleBasedDefault = role === "admin" ? "/admin" : "/candidates";
      const safeRedirect = sanitizeRedirectPath(redirectTo, roleBasedDefault);
      router.replace(safeRedirect);
    } catch {
      setErrorMessage("Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setErrorMessage(null);
    setInfoMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Enter your email address to reset your password.");
      return;
    }

    setIsResetting(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const { error } = await requestPasswordReset(trimmed, redirectTo);
      if (error) {
        setErrorMessage("Unable to send reset email.");
        return;
      }
      setInfoMessage(
        "If an account exists for this email, a reset link has been sent."
      );
    } catch {
      setErrorMessage("Unable to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  return {
    errorMessage,
    infoMessage,
    isLoading,
    isResetting,
    handleLogin,
    handlePasswordReset,
  };
}
