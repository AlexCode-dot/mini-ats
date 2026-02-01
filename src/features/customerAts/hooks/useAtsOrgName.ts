"use client";

import { useEffect, useState } from "react";

import type { AtsClient } from "@/features/customerAts/services/atsClient";

export function useAtsOrgName(client: AtsClient) {
  const [orgName, setOrgName] = useState<string>("Organization");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrg = async () => {
      try {
        const name = await client.getOrgName();
        if (isMounted) {
          setOrgName(name);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load organization"
        );
      }
    };

    loadOrg();

    return () => {
      isMounted = false;
    };
  }, [client]);

  return { orgName, error };
}
