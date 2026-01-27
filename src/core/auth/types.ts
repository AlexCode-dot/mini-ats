import type { User } from "@supabase/supabase-js";

export type ProfileRole = "admin" | "customer";

export type Profile = {
  id: string;
  org_id: string | null;
  role: ProfileRole;
  full_name: string | null;
  is_active: boolean;
};

export type Organization = {
  id: string;
  name: string | null;
  is_active: boolean;
};

export type CurrentProfile = {
  user: User;
  profile: Profile;
  org: Organization;
};
