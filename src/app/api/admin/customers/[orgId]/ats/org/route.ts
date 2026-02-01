import { NextResponse } from "next/server";

import { requireAdminApi, isAdminApiError } from "@/core/auth/requireAdminApi";
import { isUuid } from "@/core/validation/isUuid";
import { getOrgNameForAdmin } from "@/features/customerAts/services/adminAtsServer";

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

    const name = await getOrgNameForAdmin(orgId);
    return NextResponse.json(name);
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
