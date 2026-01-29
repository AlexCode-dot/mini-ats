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
import type { CreateAdminPayload } from "@/features/adminConsole/types";

export async function GET() {
  try {
    const ctx = await requireAdminApi();
    const admins = await adminConsoleService.listAdmins(ctx);
    return NextResponse.json(admins);
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
    const body = (await request.json()) as CreateAdminPayload;

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    if (!isEmail(body.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!isPasswordStrong(body.password)) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    const result = await adminConsoleService.createAdmin(ctx, body);
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
