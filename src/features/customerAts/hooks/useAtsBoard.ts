"use client";

import { useCallback, useEffect, useState } from "react";

import type { AtsClient } from "@/features/customerAts/services/atsClient";
import type {
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
} from "@/features/customerAts/types";

type AtsBoardState = {
  stages: CustomerStage[];
  candidates: CustomerCandidate[];
  jobs: CustomerJob[];
  isLoading: boolean;
  error: string | null;
};

export function useAtsBoard(client: AtsClient) {
  const [state, setState] = useState<AtsBoardState>({
    stages: [],
    candidates: [],
    jobs: [],
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const [stages, candidates, jobs] = await Promise.all([
        client.listStages(),
        client.listCandidates(),
        client.listJobs(),
      ]);
      setState({ stages, candidates, jobs, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load data",
      }));
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const setCandidates = (
    updater:
      | CustomerCandidate[]
      | ((prev: CustomerCandidate[]) => CustomerCandidate[])
  ) => {
    setState((prev) => ({
      ...prev,
      candidates:
        typeof updater === "function"
          ? (updater as (prev: CustomerCandidate[]) => CustomerCandidate[])(
              prev.candidates
            )
          : updater,
    }));
  };

  return {
    ...state,
    refresh: load,
    setCandidates,
  };
}
