import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isEmail } from "@/core/validation/isEmail";
import {
  isPasswordStrong,
  MIN_PASSWORD_LENGTH,
} from "@/core/validation/isPasswordStrong";
import {
  adminConsoleService,
  isAdminConsoleError,
} from "@/features/adminConsole/services/adminConsoleServer";
import type { CreateOrganizationPayload } from "@/features/adminConsole/types";

export async function GET() {
  try {
    const ctx = await requireAdminApi();
    const orgs = await adminConsoleService.listOrganizations(ctx);
    return NextResponse.json(orgs);
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

export async function POST(request: Request) {
  try {
    const ctx = await requireAdminMutation(request);
    const body = (await request.json()) as CreateOrganizationPayload;

    if (!body.orgName || !body.customerEmail) {
      return NextResponse.json(
        { error: "orgName and customerEmail are required" },
        { status: 400 }
      );
    }

    if (!isEmail(body.customerEmail)) {
      return NextResponse.json(
        { error: "Invalid customerEmail" },
        { status: 400 }
      );
    }

    if (!body.sendInvite) {
      if (!body.password) {
        return NextResponse.json(
          { error: "password is required unless sending invite" },
          { status: 400 }
        );
      }
      if (!isPasswordStrong(body.password)) {
        return NextResponse.json(
          {
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
          },
          { status: 400 }
        );
      }
    }

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const inviteRedirectTo = origin ? `${origin}/reset-password` : undefined;

    const result = await adminConsoleService.createOrganization(ctx, {
      ...body,
      inviteRedirectTo,
    });
    return NextResponse.json(result, { status: 201 });
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
