import { NextResponse } from "next/server";

import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { isEmail } from "@/core/validation/isEmail";
import { isUuid } from "@/core/validation/isUuid";
import {
  adminConsoleService,
  isAdminConsoleError,
} from "@/features/adminConsole/services/adminConsoleServer";
import type { UpdateOrganizationPayload } from "@/features/adminConsole/types";

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

    const body = (await request.json()) as UpdateOrganizationPayload;

    if (!body.orgName || !body.customerEmail || !body.profileId) {
      return NextResponse.json(
        { error: "orgName, customerEmail, and profileId are required" },
        { status: 400 }
      );
    }

    if (!isEmail(body.customerEmail)) {
      return NextResponse.json(
        { error: "Invalid customerEmail" },
        { status: 400 }
      );
    }

    const result = await adminConsoleService.updateOrganizationCustomer(ctx, {
      ...body,
      orgId,
    });
    return NextResponse.json(result);
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
