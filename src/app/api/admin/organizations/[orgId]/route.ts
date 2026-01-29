import { NextResponse } from "next/server";

import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { isUuid } from "@/core/validation/isUuid";
import {
  adminConsoleService,
  isAdminConsoleError,
} from "@/features/adminConsole/services/adminConsoleServer";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const ctx = await requireAdminMutation(request);
    const { orgId } = await context.params;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }
    if (!isUuid(orgId)) {
      return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
    }

    const body = (await request.json()) as { is_active?: boolean };

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be boolean" },
        { status: 400 }
      );
    }

    const updated = await adminConsoleService.toggleOrganization(
      ctx,
      orgId,
      body.is_active
    );
    return NextResponse.json(updated);
  } catch (error) {
    if (isAdminApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (isAdminConsoleError(error)) {
      const message =
        process.env.NODE_ENV === "production"
          ? "Operation failed"
          : error.message;
      return NextResponse.json({ error: message }, { status: error.status });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
