import { NextResponse } from "next/server";

import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import { updateCandidateStageForOrg } from "@/features/customerAts/services/adminAtsServer";

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

    const payload = (await request.json()) as { stageId?: string };
    if (!payload?.stageId) {
      return NextResponse.json({ error: "Missing stageId" }, { status: 400 });
    }

    if (!isUuid(payload.stageId)) {
      return NextResponse.json({ error: "Invalid stageId" }, { status: 400 });
    }

    await updateCandidateStageForOrg(orgId, candidateId, payload.stageId);
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
