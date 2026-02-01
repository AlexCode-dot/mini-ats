import { NextResponse } from "next/server";

import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import {
  archiveCandidateForOrg,
  updateCandidateForOrg,
} from "@/features/customerAts/services/adminAtsServer";
import type { UpdateCandidatePayload } from "@/features/customerAts/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string; candidateId: string }> }
) {
  try {
    await requireAdminMutation(request);
    const { orgId, candidateId } = await context.params;

    if (!orgId || !candidateId) {
      return NextResponse.json(
        { error: "Missing orgId or candidateId" },
        { status: 400 }
      );
    }

    if (!isUuid(orgId) || !isUuid(candidateId)) {
      return NextResponse.json(
        { error: "Invalid orgId or candidateId" },
        { status: 400 }
      );
    }

    const payload = (await request.json()) as
      | (UpdateCandidatePayload & { is_archived?: boolean })
      | { is_archived?: boolean };

    if (payload?.is_archived === true) {
      await archiveCandidateForOrg(orgId, candidateId);
      return NextResponse.json({ ok: true });
    }

    if (!payload?.name?.trim() || !payload?.jobId) {
      return NextResponse.json(
        { error: "Missing name or jobId" },
        { status: 400 }
      );
    }

    await updateCandidateForOrg(orgId, candidateId, {
      name: payload.name.trim(),
      jobId: payload.jobId,
      email: payload.email ?? null,
      linkedinUrl: payload.linkedinUrl ?? null,
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
