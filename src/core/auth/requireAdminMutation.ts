import "server-only";

import { requireAdminApi } from "@/core/auth/requireAdminApi";
import { requireSameOrigin } from "@/core/security/requireSameOrigin";
import type { AdminContext } from "@/core/auth/requireAdminApi";

export async function requireAdminMutation(
  request: Request
): Promise<AdminContext> {
  const ctx = await requireAdminApi();
  requireSameOrigin(request);
  return ctx;
}
