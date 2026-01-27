import { createServerSupabaseClient } from "@/core/supabase/serverClient";
import type { CurrentProfile, Organization, Profile } from "@/core/auth/types";

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, org_id, role, full_name, is_active, organizations(id, name, is_active)"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const profile: Profile = {
    id: data.id,
    org_id: data.org_id,
    role: data.role,
    full_name: data.full_name,
    is_active: data.is_active,
  };

  const orgData = Array.isArray(data.organizations)
    ? data.organizations[0]
    : data.organizations;

  if (!orgData) {
    return null;
  }

  const org: Organization = {
    id: orgData.id,
    name: orgData.name,
    is_active: orgData.is_active,
  };

  return { user, profile, org };
}
