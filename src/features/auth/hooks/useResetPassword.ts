"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";

export function useResetPassword() {
  const supabase = createBrowserSupabaseClient();
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash && hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setErrorMessage("Open the reset link from your email first.");
          }
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(Boolean(data.session));
      setIsReady(true);
    })();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleReset = async (password: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password.trim()) {
      setErrorMessage("Enter a new password.");
      return;
    }

    if (!hasSession) {
      setErrorMessage("Open the reset link from your email first.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });
      if (error) {
        setErrorMessage("Unable to reset password.");
        return;
      }
      setSuccessMessage("Password updated. You can sign in now.");
    } catch {
      setErrorMessage("Unable to reset password.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isReady,
    hasSession,
    errorMessage,
    successMessage,
    isSaving,
    handleReset,
  };
}
