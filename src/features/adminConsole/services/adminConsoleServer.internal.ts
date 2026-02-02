import "server-only";

// INTERNAL: service-role implementation. Do not import directly.

import { createServiceSupabaseClient } from "@/core/supabase/serviceClient";
import { serverEnv } from "@/core/env/serverEnv";
import {
  isPasswordStrong,
  MIN_PASSWORD_LENGTH,
} from "@/core/validation/isPasswordStrong";
import type {
  AdminAdminRow,
  AdminOrgRow,
  AdminOrgSummary,
  CreateAdminPayload,
  CreateAdminResponse,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  UpdateOrganizationPayload,
  UpdateOrganizationResponse,
} from "@/features/adminConsole/types";

class AdminConsoleError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function resolveAdminHomeOrgId() {
  const envOrgId = serverEnv.ADMIN_HOME_ORG_ID?.trim();
  if (envOrgId) {
    return envOrgId;
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", "Internal")
    .maybeSingle();

  if (error) {
    throw new AdminConsoleError(error.message);
  }

  if (data?.id) {
    return data.id;
  }

  const { data: created, error: createError } = await supabase
    .from("organizations")
    .insert({ name: "Internal", is_active: true })
    .select("id")
    .single();

  if (createError || !created) {
    throw new AdminConsoleError(
      createError?.message ?? "Failed to create internal org"
    );
  }

  return created.id;
}

function normalizeOrganization(org: {
  id: string;
  name: string | null;
  created_at: string;
  is_active: boolean | null;
}): AdminOrgRow {
  return {
    id: org.id,
    name: org.name ?? "Untitled",
    created_at: org.created_at,
    is_active: org.is_active ?? true,
    users_count: 0,
    jobs_count: 0,
    candidates_count: 0,
    customer_profile_id: null,
    customer_name: null,
    customer_email: null,
  };
}

async function getPrimaryCustomer(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  orgId: string
) {
  if (
    !supabase ||
    typeof (supabase as { from?: unknown }).from !== "function"
  ) {
    throw new AdminConsoleError("Invalid Supabase client");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("org_id", orgId)
    .eq("role", "customer")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AdminConsoleError(error.message);
  }

  if (!profile) {
    return {
      customer_profile_id: null,
      customer_name: null,
      customer_email: null,
    };
  }

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(profile.id);

  if (userError) {
    throw new AdminConsoleError(userError.message);
  }

  return {
    customer_profile_id: profile.id,
    customer_name: profile.full_name ?? null,
    customer_email: userData.user?.email ?? null,
  };
}

async function getOrgCounts(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  orgId: string
) {
  if (
    !supabase ||
    typeof (supabase as { from?: unknown }).from !== "function"
  ) {
    throw new AdminConsoleError("Invalid Supabase client");
  }

  const [users, jobs, candidates] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
    supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId),
  ]);

  if (users.error) {
    throw new AdminConsoleError(users.error.message);
  }

  if (jobs.error) {
    throw new AdminConsoleError(jobs.error.message);
  }

  if (candidates.error) {
    throw new AdminConsoleError(candidates.error.message);
  }

  return {
    users_count: users.count ?? 0,
    jobs_count: jobs.count ?? 0,
    candidates_count: candidates.count ?? 0,
  };
}

export async function listOrganizations(): Promise<AdminOrgRow[]> {
  const supabase = createServiceSupabaseClient();

  if (serverEnv.USE_ADMIN_ORG_RPC) {
    const { data, error } = await supabase.rpc("admin_list_organizations");

    if (error) {
      throw new AdminConsoleError(error.message);
    }

    const toInt = (value: unknown) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") return Number.parseInt(value, 10) || 0;
      return 0;
    };

    return (data ?? []).map((row: AdminOrgRow) => ({
      ...row,
      name: row.name ?? "Untitled",
      is_active: row.is_active ?? true,
      users_count: toInt(row.users_count),
      jobs_count: toInt(row.jobs_count),
      candidates_count: toInt(row.candidates_count),
      customer_profile_id: row.customer_profile_id ?? null,
      customer_name: row.customer_name ?? null,
      customer_email: row.customer_email ?? null,
    }));
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, created_at, is_active")
    .neq("name", "Internal")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AdminConsoleError(error.message);
  }

  const orgs = data ?? [];

  return Promise.all(
    orgs.map(async (org) => {
      // TODO: Replace N+1 calls with a single RPC/view for org counts and customer info.
      const base = normalizeOrganization(org);
      const [counts, customer] = await Promise.all([
        getOrgCounts(supabase, org.id),
        getPrimaryCustomer(supabase, org.id),
      ]);
      return { ...base, ...counts, ...customer };
    })
  );
}

export async function createOrganization(
  payload: CreateOrganizationPayload
): Promise<CreateOrganizationResponse> {
  const supabase = createServiceSupabaseClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: payload.orgName, is_active: true })
    .select("id, name, created_at, is_active")
    .single();

  if (orgError || !org) {
    throw new AdminConsoleError(orgError?.message ?? "Failed to create org");
  }

  let inviteLink: string | null = null;
  let authUserId: string | null = null;
  let authUserEmail: string | null = null;

  if (payload.sendInvite) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email: payload.customerEmail,
      ...(payload.inviteRedirectTo
        ? { redirectTo: payload.inviteRedirectTo }
        : {}),
    });

    if (error || !data?.user) {
      if (error?.message?.toLowerCase().includes("already been registered")) {
        throw new AdminConsoleError("Email already in use", 409);
      }
      throw new AdminConsoleError(
        error?.message ?? "Failed to generate invite link"
      );
    }

    authUserId = data.user.id;
    authUserEmail = data.user.email ?? payload.customerEmail;
    inviteLink =
      typeof data?.properties?.action_link === "string"
        ? data.properties.action_link
        : null;
  } else {
    const password = payload.password?.trim() ?? "";
    if (!isPasswordStrong(password)) {
      throw new AdminConsoleError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        400
      );
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: payload.customerEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: payload.customerName ?? null,
        },
      });

    if (authError || !authUser.user) {
      if (
        authError?.message?.toLowerCase().includes("already been registered")
      ) {
        throw new AdminConsoleError("Email already in use", 409);
      }
      throw new AdminConsoleError(
        authError?.message ?? "Failed to create user"
      );
    }

    authUserId = authUser.user.id;
    authUserEmail = authUser.user.email ?? payload.customerEmail;
  }

  if (!authUserId) {
    throw new AdminConsoleError("Failed to provision user");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUserId,
    org_id: org.id,
    role: "customer",
    full_name: payload.customerName ?? null,
    is_active: true,
  });

  if (profileError) {
    throw new AdminConsoleError(profileError.message);
  }

  const { count: stageCount, error: stageCountError } = await supabase
    .from("pipeline_stages")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org.id);

  if (stageCountError) {
    throw new AdminConsoleError(stageCountError.message);
  }

  if (!stageCount) {
    const stages = [
      { name: "New", position: 1, is_terminal: false },
      { name: "Screening", position: 2, is_terminal: false },
      { name: "Interview", position: 3, is_terminal: false },
      { name: "Offer", position: 4, is_terminal: false },
      { name: "Hired", position: 5, is_terminal: true },
      { name: "Rejected", position: 6, is_terminal: true },
    ].map((stage) => ({
      ...stage,
      org_id: org.id,
    }));

    const { error: stageError } = await supabase
      .from("pipeline_stages")
      .insert(stages);

    if (stageError) {
      throw new AdminConsoleError(stageError.message);
    }
  }

  const counts = await getOrgCounts(supabase, org.id);

  return {
    organization: {
      ...normalizeOrganization(org),
      ...counts,
      customer_profile_id: authUserId,
      customer_name: payload.customerName ?? null,
      customer_email: authUserEmail ?? payload.customerEmail,
    },
    customerProfile: {
      id: authUserId,
      email: authUserEmail ?? payload.customerEmail,
      full_name: payload.customerName ?? null,
      org_id: org.id,
    },
    inviteLink,
  };
}

export async function toggleOrganization(
  orgId: string,
  isActive: boolean
): Promise<AdminOrgRow> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ is_active: isActive })
    .eq("id", orgId)
    .select("id, name, created_at, is_active")
    .single();

  if (error || !data) {
    throw new AdminConsoleError(error?.message ?? "Failed to update org");
  }

  const counts = await getOrgCounts(supabase, orgId);

  return { ...normalizeOrganization(data), ...counts };
}

export async function listAdmins(): Promise<AdminAdminRow[]> {
  const supabase = createServiceSupabaseClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AdminConsoleError(error.message);
  }

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    throw new AdminConsoleError(usersError.message);
  }

  const usersById = new Map(usersData.users.map((user) => [user.id, user]));

  return (profiles ?? []).map((profile) => {
    const user = usersById.get(profile.id);
    return {
      id: profile.id,
      name: profile.full_name ?? null,
      email: user?.email ?? null,
      created_at: profile.created_at,
    };
  });
}

export async function createAdmin(
  payload: CreateAdminPayload
): Promise<CreateAdminResponse> {
  if (!isPasswordStrong(payload.password)) {
    throw new AdminConsoleError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      400
    );
  }

  const supabase = createServiceSupabaseClient();
  const password = payload.password.trim();
  const adminOrgId = await resolveAdminHomeOrgId();

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: payload.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.name ?? null,
      },
    });

  if (authError || !authUser.user) {
    throw new AdminConsoleError(authError?.message ?? "Failed to create admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authUser.user.id,
      org_id: adminOrgId,
      role: "admin",
      full_name: payload.name ?? null,
      is_active: true,
    })
    .select("id, full_name, created_at")
    .single();

  if (profileError || !profile) {
    throw new AdminConsoleError(
      profileError?.message ?? "Failed to create profile"
    );
  }

  return {
    admin: {
      id: profile.id,
      name: profile.full_name ?? null,
      email: authUser.user.email ?? null,
      created_at: profile.created_at,
    },
  };
}

export async function updateOrganizationCustomer(
  payload: UpdateOrganizationPayload
): Promise<UpdateOrganizationResponse> {
  const supabase = createServiceSupabaseClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, org_id")
    .eq("id", payload.profileId)
    .eq("org_id", payload.orgId)
    .maybeSingle();

  if (profileError) {
    throw new AdminConsoleError(profileError.message);
  }

  if (!profile) {
    throw new AdminConsoleError("Customer profile not found", 404);
  }

  const { error: orgError } = await supabase
    .from("organizations")
    .update({ name: payload.orgName })
    .eq("id", payload.orgId);

  if (orgError) {
    throw new AdminConsoleError(orgError.message);
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ full_name: payload.customerName ?? null })
    .eq("id", payload.profileId);

  if (profileUpdateError) {
    throw new AdminConsoleError(profileUpdateError.message);
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(
    payload.profileId,
    {
      email: payload.customerEmail,
      user_metadata: {
        full_name: payload.customerName ?? null,
      },
    }
  );

  if (authError) {
    throw new AdminConsoleError(authError.message);
  }

  const { data: org, error: orgFetchError } = await supabase
    .from("organizations")
    .select("id, name, created_at, is_active")
    .eq("id", payload.orgId)
    .single();

  if (orgFetchError || !org) {
    throw new AdminConsoleError(orgFetchError?.message ?? "Failed to load org");
  }

  const counts = await getOrgCounts(supabase, payload.orgId);
  const customer = await getPrimaryCustomer(supabase, payload.orgId);

  return {
    organization: { ...normalizeOrganization(org), ...counts, ...customer },
  };
}

export async function getOrganizationSummary(
  orgId: string
): Promise<AdminOrgSummary> {
  const supabase = createServiceSupabaseClient();
  return getOrgCounts(supabase, orgId);
}

export function isAdminConsoleError(
  error: unknown
): error is AdminConsoleError {
  return error instanceof AdminConsoleError;
}
