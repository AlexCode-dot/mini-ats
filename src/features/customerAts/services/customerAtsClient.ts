import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";
import type {
  CreateCandidatePayload,
  CreateJobPayload,
  CustomerCandidate,
  CustomerJob,
  CustomerStage,
  StageDraft,
  UpdateCandidatePayload,
  UpdateJobPayload,
} from "@/features/customerAts/types";

let cachedOrgId: string | null = null;
let cachedUserId: string | null = null;
let cachedOrgName: string | null = null;

async function getOrgId(): Promise<string> {
  const supabase = createBrowserSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Unable to load user");
  }

  if (cachedOrgId && cachedUserId === userData.user.id) {
    return cachedOrgId;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (error || !profile?.org_id) {
    throw new Error(error?.message ?? "Unable to load organization");
  }

  cachedOrgId = profile.org_id;
  cachedUserId = userData.user.id;
  cachedOrgName = null;
  return profile.org_id;
}

export async function getOrgName(): Promise<string> {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();

  if (cachedOrgName) {
    return cachedOrgName;
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle();

  if (error || !org?.name) {
    throw new Error(error?.message ?? "Unable to load organization");
  }

  cachedOrgName = org.name;
  return org.name;
}

export async function listCustomerStages(): Promise<CustomerStage[]> {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("id, name, position, is_terminal")
    .eq("org_id", orgId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerStage[];
}

export async function listCustomerJobs(): Promise<CustomerJob[]> {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, job_url, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerJob[];
}

export async function createJob(payload: CreateJobPayload) {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();
  const { error } = await supabase.from("jobs").insert({
    org_id: orgId,
    title: payload.title,
    status: payload.status ?? "open",
    job_url: payload.jobUrl ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateJob(jobId: string, payload: UpdateJobPayload) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      title: payload.title,
      status: payload.status ?? "open",
      job_url: payload.jobUrl ?? null,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteJob(jobId: string) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listCustomerCandidates(): Promise<CustomerCandidate[]> {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, name, email, linkedin_url, stage_id, job_id, is_archived, jobs(title)"
    )
    .eq("org_id", orgId)
    .eq("is_archived", false);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? null,
      linkedin_url: row.linkedin_url ?? null,
      stage_id: row.stage_id,
      job_id: row.job_id ?? null,
      job_title: job?.title ?? null,
    } satisfies CustomerCandidate;
  });
}

export async function createCandidate(payload: CreateCandidatePayload) {
  const supabase = createBrowserSupabaseClient();
  const orgId = await getOrgId();
  const { error } = await supabase.from("candidates").insert({
    org_id: orgId,
    name: payload.name,
    email: payload.email ?? null,
    linkedin_url: payload.linkedinUrl ?? null,
    stage_id: payload.stageId,
    job_id: payload.jobId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCandidateStage(
  candidateId: string,
  stageId: string
) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase
    .from("candidates")
    .update({ stage_id: stageId })
    .eq("id", candidateId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCandidate(
  candidateId: string,
  payload: UpdateCandidatePayload
) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase
    .from("candidates")
    .update({
      name: payload.name,
      email: payload.email ?? null,
      linkedin_url: payload.linkedinUrl ?? null,
      job_id: payload.jobId,
    })
    .eq("id", candidateId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateStages(stages: CustomerStage[]) {
  const supabase = createBrowserSupabaseClient();
  if (stages.length === 0) return;

  const updateResults = await Promise.all(
    stages.map((stage) =>
      supabase
        .from("pipeline_stages")
        .update({ name: stage.name, is_terminal: stage.is_terminal })
        .eq("id", stage.id)
    )
  );

  const updateError = updateResults.find((result) => result.error)?.error;
  if (updateError) {
    throw new Error(updateError.message);
  }

  const orderedIds = [...stages]
    .sort((a, b) => a.position - b.position)
    .map((stage) => stage.id);

  if (orderedIds.length === 0) return;

  const { error: reorderError } = await supabase.rpc(
    "reorder_pipeline_stages",
    {
      stage_ids: orderedIds,
    }
  );

  if (reorderError) {
    throw new Error(reorderError.message);
  }
}

export async function createStages(stages: StageDraft[]) {
  const supabase = createBrowserSupabaseClient();
  const payload = stages.map((stage) => ({
    name: stage.name,
    position: stage.position,
    is_terminal: stage.is_terminal,
  }));

  if (payload.length === 0) return [];

  const { data, error } = await supabase
    .from("pipeline_stages")
    .insert(payload)
    .select("id, name, position, is_terminal");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function deleteStageWithCandidates(
  stageId: string,
  fallbackStageId: string
) {
  const supabase = createBrowserSupabaseClient();

  const { error: updateError } = await supabase
    .from("candidates")
    .update({ stage_id: fallbackStageId })
    .eq("stage_id", stageId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await supabase
    .from("pipeline_stages")
    .delete()
    .eq("id", stageId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function resetOrgIdCache() {
  cachedOrgId = null;
  cachedUserId = null;
  cachedOrgName = null;
}
