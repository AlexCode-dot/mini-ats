import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import {
  createCandidateForOrg,
  listCandidatesForOrg,
} from "@/features/customerAts/services/adminAtsServer";
import type { CreateCandidatePayload } from "@/features/customerAts/types";

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

    const candidates = await listCandidatesForOrg(orgId);
    return NextResponse.json(candidates);
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

    const payload = (await request.json()) as CreateCandidatePayload;
    if (!payload?.name?.trim()) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    if (!payload?.jobId || !payload?.stageId) {
      return NextResponse.json(
        { error: "Missing jobId or stageId" },
        { status: 400 }
      );
    }

    await createCandidateForOrg(orgId, {
      name: payload.name.trim(),
      jobId: payload.jobId,
      stageId: payload.stageId,
      email: payload.email ?? null,
      linkedinUrl: payload.linkedinUrl ?? null,
      resumeUrl: payload.resumeUrl ?? null,
      note: payload.note ?? null,
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
