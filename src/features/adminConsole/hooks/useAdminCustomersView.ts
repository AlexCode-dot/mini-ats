"use client";

import { useMemo, useState } from "react";

import { useAdminModals } from "@/features/adminConsole/hooks/useAdminModals";
import { useAdminOrganizations } from "@/features/adminConsole/hooks/useAdminOrganizations";
import type { AdminOrgRow } from "@/features/adminConsole/types";

export type AdminCustomersViewState = {
  isLoading: boolean;
  error: string | null;
  actionError: string | null;
  savingOrgIds: string[];
};

export type AdminCustomersViewFilters = {
  query: string;
  setQuery: (value: string) => void;
};

export type AdminCustomersViewData = {
  organizations: AdminOrgRow[];
  filtered: AdminOrgRow[];
};

export type AdminCustomersViewModals = {
  adminModals: ReturnType<typeof useAdminModals>;
  editingOrg: AdminOrgRow | null;
  openEditOrganization: (org: AdminOrgRow) => void;
  closeEditOrganization: () => void;
};

export type AdminCustomersViewActions = {
  createOrganization: ReturnType<
    typeof useAdminOrganizations
  >["actions"]["createOrganization"];
  toggleOrganization: ReturnType<
    typeof useAdminOrganizations
  >["actions"]["toggleOrganization"];
  updateOrganization: ReturnType<
    typeof useAdminOrganizations
  >["actions"]["updateOrganization"];
};

export type AdminCustomersView = {
  state: AdminCustomersViewState;
  filters: AdminCustomersViewFilters;
  data: AdminCustomersViewData;
  modals: AdminCustomersViewModals;
  actions: AdminCustomersViewActions;
};

export function useAdminCustomersView(): AdminCustomersView {
  const [query, setQuery] = useState("");
  const [editingOrg, setEditingOrg] = useState<AdminOrgRow | null>(null);
  const {
    state: orgState,
    data: orgData,
    actions: orgActions,
  } = useAdminOrganizations();
  const modals = useAdminModals();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orgData.organizations;
    return orgData.organizations.filter((org) =>
      org.name.toLowerCase().includes(term)
    );
  }, [orgData.organizations, query]);

  const openEditOrganization = (org: AdminOrgRow) => {
    setEditingOrg(org);
  };

  const closeEditOrganization = () => setEditingOrg(null);

  return {
    state: {
      isLoading: orgState.isLoading,
      error: orgState.error,
      actionError: orgState.actionError,
      savingOrgIds: orgState.savingOrgIds,
    },
    filters: {
      query,
      setQuery,
    },
    data: {
      organizations: orgData.organizations,
      filtered,
    },
    modals: {
      adminModals: modals,
      editingOrg,
      openEditOrganization,
      closeEditOrganization,
    },
    actions: {
      createOrganization: orgActions.createOrganization,
      toggleOrganization: orgActions.toggleOrganization,
      updateOrganization: orgActions.updateOrganization,
    },
  };
}
