"use client";

import { useState } from "react";

export function useAdminModals() {
  const [isCreateCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [isCreateAdminOpen, setCreateAdminOpen] = useState(false);

  return {
    isCreateCustomerOpen,
    isCreateAdminOpen,
    openCreateCustomer: () => setCreateCustomerOpen(true),
    closeCreateCustomer: () => setCreateCustomerOpen(false),
    openCreateAdmin: () => setCreateAdminOpen(true),
    closeCreateAdmin: () => setCreateAdminOpen(false),
  };
}
