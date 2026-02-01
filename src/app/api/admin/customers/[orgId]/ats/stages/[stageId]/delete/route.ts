import { NextResponse } from "next/server";

import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isAdminApiError } from "@/core/auth/requireAdminApi";
import { isUuid } from "@/core/validation/isUuid";
import { deleteStageWithCandidatesForOrg } from "@/features/customerAts/services/adminAtsServer";

export async function POST(
  request: Request,
  context: { params: Promise<{ orgId: string; stageId: string }> }
) {
  try {
    await requireAdminMutation(request);
    const { orgId, stageId } = await context.params;

    if (!orgId || !stageId) {
      return NextResponse.json(
        { error: "Missing orgId or stageId" },
        { status: 400 }
      );
    }

    if (!isUuid(orgId) || !isUuid(stageId)) {
      return NextResponse.json(
        { error: "Invalid orgId or stageId" },
        { status: 400 }
      );
    }

    const payload = (await request.json()) as { fallbackStageId?: string };
    if (!payload?.fallbackStageId) {
      return NextResponse.json(
        { error: "Missing fallbackStageId" },
        { status: 400 }
      );
    }

    if (!isUuid(payload.fallbackStageId)) {
      return NextResponse.json(
        { error: "Invalid fallbackStageId" },
        { status: 400 }
      );
    }

    await deleteStageWithCandidatesForOrg(
      orgId,
      stageId,
      payload.fallbackStageId
    );
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
