import "server-only";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const adminHomeOrgId = process.env.ADMIN_HOME_ORG_ID ?? null;

if (process.env.NODE_ENV === "production" && !adminHomeOrgId) {
  throw new Error("Missing required environment variable: ADMIN_HOME_ORG_ID");
}

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY"
  ),
  ADMIN_HOME_ORG_ID: adminHomeOrgId,
  USE_ADMIN_ORG_RPC: process.env.USE_ADMIN_ORG_RPC === "true",
} as const;
