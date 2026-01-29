import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/core/auth/getCurrentProfile";

export async function GET() {
  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      name: profile.profile.full_name,
      email: profile.user.email ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
