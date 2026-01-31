"use client";

import { useCallback, useEffect, useState } from "react";

import {
  listCustomerCandidates,
  listCustomerJobs,
  listCustomerStages,
} from "@/features/customerAts/services/customerAtsClient";
import type {
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
} from "@/features/customerAts/types";

type CustomerBoardState = {
  stages: CustomerStage[];
  candidates: CustomerCandidate[];
  jobs: CustomerJob[];
  isLoading: boolean;
  error: string | null;
};

export function useCustomerBoard() {
  const [state, setState] = useState<CustomerBoardState>({
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
        listCustomerStages(),
        listCustomerCandidates(),
        listCustomerJobs(),
      ]);
      setState({ stages, candidates, jobs, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load data",
      }));
    }
  }, []);

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
