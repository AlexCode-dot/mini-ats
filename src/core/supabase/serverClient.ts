import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/core/env/publicEnv";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie mutations can be disallowed in some server contexts.
          }
        },
      },
    }
  );
}
