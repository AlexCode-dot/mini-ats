import type {
  CreateCandidatePayload,
  CreateJobPayload,
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
  StageDraft,
  UpdateCandidatePayload,
  UpdateJobPayload,
} from "@/features/customerAts/types";
import {
  archiveCandidate,
  createCandidate,
  createJob,
  createStages,
  deleteJob,
  deleteStageWithCandidates,
  getOrgName,
  listCustomerCandidates,
  listCustomerJobs,
  listCustomerStages,
  updateCandidate,
  updateCandidateStage,
  updateJob,
  updateStages,
} from "@/features/customerAts/services/customerAtsClient";
import { parseApiError } from "@/core/errors/parseApiError";

export type AtsClient = {
  getOrgName: () => Promise<string>;
  listStages: () => Promise<CustomerStage[]>;
  listJobs: () => Promise<CustomerJob[]>;
  listCandidates: () => Promise<CustomerCandidate[]>;
  createJob: (payload: CreateJobPayload) => Promise<void>;
  updateJob: (jobId: string, payload: UpdateJobPayload) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  createCandidate: (payload: CreateCandidatePayload) => Promise<void>;
  updateCandidate: (candidateId: string, payload: UpdateCandidatePayload) => Promise<void>;
  updateCandidateStage: (candidateId: string, stageId: string) => Promise<void>;
  archiveCandidate: (candidateId: string) => Promise<void>;
  createStages: (stages: StageDraft[]) => Promise<CustomerStage[]>;
  updateStages: (stages: CustomerStage[]) => Promise<void>;
  deleteStageWithCandidates: (stageId: string, fallbackStageId: string) => Promise<void>;
};

export function createCustomerAtsClient(): AtsClient {
  return {
    getOrgName,
    listStages: listCustomerStages,
    listJobs: listCustomerJobs,
    listCandidates: listCustomerCandidates,
    createJob,
    updateJob,
    deleteJob,
    createCandidate,
    updateCandidate,
    updateCandidateStage,
    archiveCandidate,
    createStages,
    updateStages: async (stages) => updateStages(stages),
    deleteStageWithCandidates,
  };
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers ?? {}),
  };

  const response = await fetch(input, { ...init, headers });
  if (!response.ok) {
    const apiError = await parseApiError(response);
    throw apiError;
  }
  return (await response.json()) as T;
}

export function createAdminAtsClient(orgId: string): AtsClient {
  const base = `/api/admin/customers/${orgId}/ats`;

  return {
    getOrgName: () => request<string>(`${base}/org`),
    listStages: () => request<CustomerStage[]>(`${base}/stages`),
    listJobs: () => request<CustomerJob[]>(`${base}/jobs`),
    listCandidates: () => request<CustomerCandidate[]>(`${base}/candidates`),
    createJob: (payload) =>
      request<void>(`${base}/jobs`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateJob: (jobId, payload) =>
      request<void>(`${base}/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteJob: (jobId) =>
      request<void>(`${base}/jobs/${jobId}`, {
        method: "DELETE",
      }),
    createCandidate: (payload) =>
      request<void>(`${base}/candidates`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateCandidate: (candidateId, payload) =>
      request<void>(`${base}/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    updateCandidateStage: (candidateId, stageId) =>
      request<void>(`${base}/candidates/${candidateId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stageId }),
      }),
    archiveCandidate: (candidateId) =>
      request<void>(`${base}/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_archived: true }),
      }),
    createStages: (stages) =>
      request<CustomerStage[]>(`${base}/stages`, {
        method: "POST",
        body: JSON.stringify({ stages }),
      }),
    updateStages: (stages) =>
      request<void>(`${base}/stages`, {
        method: "PATCH",
        body: JSON.stringify({ stages }),
      }),
    deleteStageWithCandidates: (stageId, fallbackStageId) =>
      request<void>(`${base}/stages/${stageId}/delete`, {
        method: "POST",
        body: JSON.stringify({ fallbackStageId }),
      }),
  };
}
