"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchUserRole, signInWithPassword } from "@/features/auth/services/authClient";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error || !data.user) {
        setErrorMessage(error?.message ?? "Unable to sign in.");
        return;
      }

      const { role, errorMessage: roleError } = await fetchUserRole(
        data.user.id
      );

      if (roleError) {
        setErrorMessage(roleError);
        return;
      }

      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      if (role === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/candidates");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    errorMessage,
    isLoading,
    handleLogin,
  };
}
