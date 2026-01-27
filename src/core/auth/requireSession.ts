import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/core/supabase/serverClient";

export async function requireSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
