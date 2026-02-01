"use client";

import { useMemo } from "react";

import { createCustomerAtsClient } from "@/features/customerAts/services/atsClient";
import { useAtsOrgName } from "@/features/customerAts/hooks/useAtsOrgName";

export function useCustomerOrgName() {
  const client = useMemo(() => createCustomerAtsClient(), []);
  return useAtsOrgName(client);
}
