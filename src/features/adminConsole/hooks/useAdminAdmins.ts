"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createAdmin,
  fetchAdmins,
} from "@/features/adminConsole/services/adminConsoleApi";
import type {
  AdminAdminRow,
  CreateAdminPayload,
  CreateAdminResponse,
} from "@/features/adminConsole/types";

export function useAdminAdmins() {
  const [admins, setAdmins] = useState<AdminAdminRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleCreate = useCallback(
    async (payload: CreateAdminPayload): Promise<CreateAdminResponse> => {
      const result = await createAdmin(payload);
      await loadAdmins();
      return result;
    },
    [loadAdmins]
  );

  return {
    admins,
    isLoading,
    error,
    refresh: loadAdmins,
    createAdmin: handleCreate,
  };
}
