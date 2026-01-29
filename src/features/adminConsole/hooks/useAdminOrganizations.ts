"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createOrganization,
  fetchOrganizations,
  toggleOrganizationActive,
  updateOrganizationCustomer,
} from "@/features/adminConsole/services/adminConsoleApi";
import type {
  AdminOrgRow,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  UpdateOrganizationPayload,
  UpdateOrganizationResponse,
} from "@/features/adminConsole/types";

export function useAdminOrganizations() {
  const [organizations, setOrganizations] = useState<AdminOrgRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingOrgIds, setSavingOrgIds] = useState<string[]>([]);

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleCreate = useCallback(
    async (
      payload: CreateOrganizationPayload
    ): Promise<CreateOrganizationResponse> => {
      const result = await createOrganization(payload);
      await loadOrganizations();
      return result;
    },
    [loadOrganizations]
  );

  const handleToggle = useCallback(async (orgId: string, isActive: boolean) => {
    setActionError(null);
    setSavingOrgIds((prev) => (prev.includes(orgId) ? prev : [...prev, orgId]));
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === orgId ? { ...org, is_active: isActive } : org
      )
    );

    try {
      const updated = await toggleOrganizationActive(orgId, isActive);
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? updated : org))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update";
      setActionError(message);
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === orgId ? { ...org, is_active: !isActive } : org
        )
      );
    } finally {
      setSavingOrgIds((prev) => prev.filter((id) => id !== orgId));
    }
  }, []);

  const handleUpdate = useCallback(
    async (
      payload: UpdateOrganizationPayload
    ): Promise<UpdateOrganizationResponse> => {
      setActionError(null);
      setSavingOrgIds((prev) =>
        prev.includes(payload.orgId) ? prev : [...prev, payload.orgId]
      );

      try {
        const result = await updateOrganizationCustomer(payload);
        setOrganizations((prev) =>
          prev.map((org) =>
            org.id === payload.orgId ? result.organization : org
          )
        );
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update";
        setActionError(message);
        throw err;
      } finally {
        setSavingOrgIds((prev) => prev.filter((id) => id !== payload.orgId));
      }
    },
    []
  );

  return {
    organizations,
    isLoading,
    error,
    actionError,
    savingOrgIds,
    refresh: loadOrganizations,
    createOrganization: handleCreate,
    toggleOrganization: handleToggle,
    updateOrganization: handleUpdate,
    setOrganizations,
  };
}
