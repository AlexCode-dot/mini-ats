"use client";

import { useMemo } from "react";

import { createCustomerAtsClient } from "@/features/customerAts/services/atsClient";
import { useAtsBoard } from "@/features/customerAts/hooks/useAtsBoard";

export function useCustomerBoard() {
  const client = useMemo(() => createCustomerAtsClient(), []);
  return useAtsBoard(client);
}
