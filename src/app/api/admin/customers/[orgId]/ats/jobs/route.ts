import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import {
  createJobForOrg,
  listJobsForOrg,
} from "@/features/customerAts/services/adminAtsServer";
import type { CreateJobPayload } from "@/features/customerAts/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    await requireAdminApi();
    const { orgId } = await context.params;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    if (!isUuid(orgId)) {
      return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
    }

    const jobs = await listJobsForOrg(orgId);
    return NextResponse.json(jobs);
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

export async function POST(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    await requireAdminMutation(request);
    const { orgId } = await context.params;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    if (!isUuid(orgId)) {
      return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
    }

    const payload = (await request.json()) as CreateJobPayload;
    if (!payload?.title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    await createJobForOrg(orgId, {
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
