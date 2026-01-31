"use client";

import { useEffect, useState } from "react";

import { getOrgName } from "@/features/customerAts/services/customerAtsClient";

export function useCustomerOrgName() {
  const [orgName, setOrgName] = useState<string>("Organization");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrg = async () => {
      try {
        const name = await getOrgName();
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
  }, []);

  return { orgName, error };
}
