import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { isUuid } from "@/core/validation/isUuid";
import {
  adminConsoleService,
  isAdminConsoleError,
} from "@/features/adminConsole/services/adminConsoleServer";

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const ctx = await requireAdminApi();
    const { orgId } = await context.params;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    if (!isUuid(orgId)) {
      return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
    }

    const summary = await adminConsoleService.getOrganizationSummary(
      ctx,
      orgId
    );
    return NextResponse.json(summary);
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

    console.error(error);
    const message =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : "Server error"
        : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
