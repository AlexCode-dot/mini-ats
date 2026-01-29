"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchOrgCandidates,
  fetchOrgJobs,
  fetchOrgSummary,
} from "@/features/adminConsole/services/adminConsoleApi";
import type {
  AdminCandidatesResponse,
  AdminJob,
  AdminOrgSummary,
} from "@/features/adminConsole/types";

type CustomerContextState = {
  candidates: AdminCandidatesResponse | null;
  jobs: AdminJob[];
  summary: AdminOrgSummary | null;
  isLoading: boolean;
  error: string | null;
};

type CustomerContextView = "candidates" | "jobs";

type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

const TTL_MS = 45_000;
const summaryCache = new Map<string, CacheEntry<AdminOrgSummary>>();
const candidatesCache = new Map<string, CacheEntry<AdminCandidatesResponse>>();
const jobsCache = new Map<string, CacheEntry<AdminJob[]>>();
const inFlight = new Map<string, Promise<unknown>>();

async function fetchWithCache<T>(
  key: string,
  cache: Map<string, CacheEntry<T>>,
  fetcher: () => Promise<T>,
  force: boolean
) {
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.timestamp < TTL_MS) {
    return cached.value;
  }

  if (!force && inFlight.has(key)) {
    return (await inFlight.get(key)) as T;
  }

  const promise = fetcher();
  inFlight.set(key, promise);

  try {
    const data = await promise;
    cache.set(key, { value: data, timestamp: Date.now() });
    return data;
  } finally {
    inFlight.delete(key);
  }
}

export function useAdminCustomerContext(
  orgId: string,
  view: CustomerContextView
) {
  const [state, setState] = useState<CustomerContextState>({
    candidates: null,
    jobs: [],
    summary: null,
    isLoading: true,
    error: null,
  });

  const load = useCallback(
    async (force = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const summary = await fetchWithCache(
          `summary:${orgId}`,
          summaryCache,
          () => fetchOrgSummary(orgId),
          force
        );

        const candidates =
          view === "candidates"
            ? await fetchWithCache(
                `candidates:${orgId}`,
                candidatesCache,
                () => fetchOrgCandidates(orgId),
                force
              )
            : null;

        const jobs =
          view === "jobs"
            ? await fetchWithCache(
                `jobs:${orgId}`,
                jobsCache,
                () => fetchOrgJobs(orgId),
                force
              )
            : (jobsCache.get(`jobs:${orgId}`)?.value ?? []);

        setState({
          candidates,
          jobs,
          summary,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [orgId, view]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    refresh: () => load(true),
  };
}
