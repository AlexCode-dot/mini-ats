import { NextResponse } from "next/server";

import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import {
  deleteJobForOrg,
  updateJobForOrg,
} from "@/features/customerAts/services/adminAtsServer";
import type { UpdateJobPayload } from "@/features/customerAts/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string; jobId: string }> }
) {
  try {
    await requireAdminMutation(request);
    const { orgId, jobId } = await context.params;

    if (!orgId || !jobId) {
      return NextResponse.json(
        { error: "Missing orgId or jobId" },
        { status: 400 }
      );
    }

    if (!isUuid(orgId) || !isUuid(jobId)) {
      return NextResponse.json(
        { error: "Invalid orgId or jobId" },
        { status: 400 }
      );
    }

    const payload = (await request.json()) as UpdateJobPayload;
    if (!payload?.title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    await updateJobForOrg(orgId, jobId, {
      title: payload.title.trim(),
      status: payload.status ?? "open",
      jobUrl: payload.jobUrl ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ orgId: string; jobId: string }> }
) {
  try {
    await requireAdminMutation(request);
    const { orgId, jobId } = await context.params;

    if (!orgId || !jobId) {
      return NextResponse.json(
        { error: "Missing orgId or jobId" },
        { status: 400 }
      );
    }

    if (!isUuid(orgId) || !isUuid(jobId)) {
      return NextResponse.json(
        { error: "Invalid orgId or jobId" },
        { status: 400 }
      );
    }

    await deleteJobForOrg(orgId, jobId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isAdminApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
