import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { requireAdminMutation } from "@/core/auth/requireAdminMutation";
import { isUuid } from "@/core/validation/isUuid";
import {
  createStagesForOrg,
  listStagesForOrg,
  updateStagesForOrg,
} from "@/features/customerAts/services/adminAtsServer";
import type { CustomerStage, StageDraft } from "@/features/customerAts/types";

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

    const stages = await listStagesForOrg(orgId);
    return NextResponse.json(stages);
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

    const payload = (await request.json()) as { stages?: StageDraft[] };
    if (!payload?.stages || !Array.isArray(payload.stages)) {
      return NextResponse.json({ error: "Missing stages" }, { status: 400 });
    }

    const stages = await createStagesForOrg(orgId, payload.stages);
    return NextResponse.json(stages);
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

export async function PATCH(
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

    const payload = (await request.json()) as { stages?: CustomerStage[] };
    if (!payload?.stages || !Array.isArray(payload.stages)) {
      return NextResponse.json({ error: "Missing stages" }, { status: 400 });
    }

    await updateStagesForOrg(orgId, payload.stages);
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
