import "server-only";

import {
  ADMIN_CONTEXT_BRAND,
  type AdminContext,
} from "@/core/auth/requireAdminApi";
// eslint-disable-next-line no-restricted-imports
import {
  createAdmin as createAdminInternal,
  createOrganization as createOrganizationInternal,
  getOrganizationSummary as getOrganizationSummaryInternal,
  isAdminConsoleError,
  listAdmins as listAdminsInternal,
  listOrganizations as listOrganizationsInternal,
  toggleOrganization as toggleOrganizationInternal,
  updateOrganizationCustomer as updateOrganizationCustomerInternal,
} from "@/features/adminConsole/services/adminConsoleServer.internal";
import type {
  AdminAdminRow,
  AdminOrgRow,
  AdminOrgSummary,
  CreateAdminPayload,
  CreateAdminResponse,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  UpdateOrganizationPayload,
  UpdateOrganizationResponse,
} from "@/features/adminConsole/types";

function assertAdminContext(ctx: unknown): asserts ctx is AdminContext {
  if (
    !ctx ||
    typeof ctx !== "object" ||
    (ctx as AdminContext)[ADMIN_CONTEXT_BRAND] !== true ||
    (ctx as AdminContext).profile?.role !== "admin" ||
    typeof (ctx as AdminContext).user?.id !== "string"
  ) {
    throw new Error("Invalid admin context");
  }
}

export const adminConsoleService = {
  async listOrganizations(ctx: AdminContext): Promise<AdminOrgRow[]> {
    assertAdminContext(ctx);
    return listOrganizationsInternal();
  },
  async createOrganization(
    ctx: AdminContext,
    payload: CreateOrganizationPayload
  ): Promise<CreateOrganizationResponse> {
    assertAdminContext(ctx);
    return createOrganizationInternal(payload);
  },
  async toggleOrganization(
    ctx: AdminContext,
    orgId: string,
    isActive: boolean
  ): Promise<AdminOrgRow> {
    assertAdminContext(ctx);
    return toggleOrganizationInternal(orgId, isActive);
  },
  async listAdmins(ctx: AdminContext): Promise<AdminAdminRow[]> {
    assertAdminContext(ctx);
    return listAdminsInternal();
  },
  async createAdmin(
    ctx: AdminContext,
    payload: CreateAdminPayload
  ): Promise<CreateAdminResponse> {
    assertAdminContext(ctx);
    return createAdminInternal(payload);
  },
  async updateOrganizationCustomer(
    ctx: AdminContext,
    payload: UpdateOrganizationPayload
  ): Promise<UpdateOrganizationResponse> {
    assertAdminContext(ctx);
    return updateOrganizationCustomerInternal(payload);
  },
  async getOrganizationSummary(
    ctx: AdminContext,
    orgId: string
  ): Promise<AdminOrgSummary> {
    assertAdminContext(ctx);
    return getOrganizationSummaryInternal(orgId);
  },
};

export { isAdminConsoleError };
