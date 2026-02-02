import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";

export type LoginResult = {
  role: "admin" | "customer" | null;
  errorMessage: string | null;
};

export async function signInWithPassword(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function requestPasswordReset(email: string, redirectTo?: string) {
  const supabase = createBrowserSupabaseClient();

  return supabase.auth.resetPasswordForEmail(email, {
    ...(redirectTo ? { redirectTo } : {}),
  });
}

export async function fetchUserRole(userId: string): Promise<LoginResult> {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { role: null, errorMessage: error.message };
  }

  return { role: data?.role ?? null, errorMessage: null };
}
