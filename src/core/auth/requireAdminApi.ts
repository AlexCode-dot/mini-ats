import "server-only";

import { getCurrentProfile } from "@/core/auth/getCurrentProfile";
import type { CurrentProfile } from "@/core/auth/types";

export const ADMIN_CONTEXT_BRAND: unique symbol = Symbol("AdminContext");
export type AdminContext = CurrentProfile & {
  readonly [ADMIN_CONTEXT_BRAND]: true;
};

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}

export async function requireAdminApi(): Promise<AdminContext> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new AdminApiError("Unauthorized", 401);
  }

  if (profile.profile.role !== "admin") {
    throw new AdminApiError("Forbidden", 403);
  }

  if (!profile.profile.is_active || !profile.org.is_active) {
    throw new AdminApiError("Forbidden", 403);
  }

  const adminContext: AdminContext = {
    ...profile,
    [ADMIN_CONTEXT_BRAND]: true,
  };
  return adminContext;
}
