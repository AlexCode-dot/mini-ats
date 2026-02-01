"use client";

import { useMemo, useState } from "react";

import { useAdminAdmins } from "@/features/adminConsole/hooks/useAdminAdmins";
import { useAdminModals } from "@/features/adminConsole/hooks/useAdminModals";

export type AdminAdminsViewState = {
  isLoading: boolean;
  error: string | null;
};

export type AdminAdminsViewFilters = {
  query: string;
  setQuery: (value: string) => void;
};

export type AdminAdminsViewData = {
  admins: ReturnType<typeof useAdminAdmins>["admins"];
  filtered: ReturnType<typeof useAdminAdmins>["admins"];
};

export type AdminAdminsViewModals = {
  adminModals: ReturnType<typeof useAdminModals>;
};

export type AdminAdminsViewActions = {
  createAdmin: ReturnType<typeof useAdminAdmins>["createAdmin"];
};

export type AdminAdminsView = {
  state: AdminAdminsViewState;
  filters: AdminAdminsViewFilters;
  data: AdminAdminsViewData;
  modals: AdminAdminsViewModals;
  actions: AdminAdminsViewActions;
};

export function useAdminAdminsView(): AdminAdminsView {
  const { admins, isLoading, error, createAdmin } = useAdminAdmins();
  const modals = useAdminModals();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return admins;
    return admins.filter((admin) => {
      const name = admin.name?.toLowerCase() ?? "";
      const email = admin.email?.toLowerCase() ?? "";
      return name.includes(term) || email.includes(term);
    });
  }, [admins, query]);

  return {
    state: {
      isLoading,
      error,
    },
    filters: {
      query,
      setQuery,
    },
    data: {
      admins,
      filtered,
    },
    modals: {
      adminModals: modals,
    },
    actions: {
      createAdmin,
    },
  };
}
