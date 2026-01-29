"use client";

import type {
  AdminAdminRow,
  AdminCandidatesResponse,
  AdminJob,
  AdminOrgRow,
  AdminOrgSummary,
  CreateAdminPayload,
  CreateAdminResponse,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  UpdateOrganizationPayload,
  UpdateOrganizationResponse,
} from "@/features/adminConsole/types";
import { parseApiError } from "@/core/errors/parseApiError";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const headers = {
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers ?? {}),
  };

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const apiError = await parseApiError(response);
    throw apiError;
  }

  return (await response.json()) as T;
}

export async function fetchOrganizations(): Promise<AdminOrgRow[]> {
  return request<AdminOrgRow[]>("/api/admin/organizations");
}

export async function createOrganization(
  payload: CreateOrganizationPayload
): Promise<CreateOrganizationResponse> {
  return request<CreateOrganizationResponse>("/api/admin/organizations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleOrganizationActive(
  orgId: string,
  isActive: boolean
): Promise<AdminOrgRow> {
  return request<AdminOrgRow>(`/api/admin/organizations/${orgId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function fetchAdmins(): Promise<AdminAdminRow[]> {
  return request<AdminAdminRow[]>("/api/admin/admins");
}

export async function createAdmin(
  payload: CreateAdminPayload
): Promise<CreateAdminResponse> {
  return request<CreateAdminResponse>("/api/admin/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationCustomer(
  payload: UpdateOrganizationPayload
): Promise<UpdateOrganizationResponse> {
  return request<UpdateOrganizationResponse>(
    `/api/admin/customers/${payload.orgId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchOrgSummary(orgId: string): Promise<AdminOrgSummary> {
  return request<AdminOrgSummary>(`/api/admin/customers/${orgId}/summary`);
}

export async function fetchOrgCandidates(
  orgId: string
): Promise<AdminCandidatesResponse> {
  return request<AdminCandidatesResponse>(
    `/api/admin/customers/${orgId}/candidates`
  );
}

export async function fetchOrgJobs(orgId: string): Promise<AdminJob[]> {
  return request<AdminJob[]>(`/api/admin/customers/${orgId}/jobs`);
}
