import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/core/auth/getCurrentProfile";
import type { CurrentProfile, ProfileRole } from "@/core/auth/types";

function redirectForRole(role: ProfileRole) {
  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/candidates");
}

function ensureActive(profile: CurrentProfile) {
  if (!profile.profile.is_active || !profile.org.is_active) {
    redirect("/login?reason=inactive");
  }
}

export async function requireRole(allowedRoles: ProfileRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  ensureActive(profile);

  if (!allowedRoles.includes(profile.profile.role)) {
    redirectForRole(profile.profile.role);
  }

  return profile;
}
