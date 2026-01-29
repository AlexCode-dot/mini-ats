import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/core/env/publicEnv";
import { serverEnv } from "@/core/env/serverEnv";

export function createServiceSupabaseClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  );
}
