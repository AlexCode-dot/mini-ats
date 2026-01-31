import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";

export async function signOutUser() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
