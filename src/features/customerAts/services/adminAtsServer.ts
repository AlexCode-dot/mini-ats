import "server-only";

import { createServerSupabaseClient } from "@/core/supabase/serverClient";
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

type CandidateRow = {
  id: string;
  name: string;
  email: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  note: string | null;
  stage_id: string;
  job_id: string | null;
  jobs?:
    | { title?: string | null; status?: string | null }
    | { title?: string | null; status?: string | null }[]
    | null;
};

function mapCandidates(
  rows: CandidateRow[] | null | undefined
): CustomerCandidate[] {
  return (rows ?? []).map((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? null,
      linkedin_url: row.linkedin_url ?? null,
      resume_url: row.resume_url ?? null,
      note: row.note ?? null,
      stage_id: row.stage_id,
      job_id: row.job_id ?? null,
      job_title: job?.title ?? null,
      job_status: job?.status ?? null,
    } satisfies CustomerCandidate;
  });
}

export async function getOrgNameForAdmin(orgId: string): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle();

  if (error || !data?.name) {
    throw new Error(error?.message ?? "Unable to load organization");
  }

  return data.name;
}

export async function listStagesForOrg(
  orgId: string
): Promise<CustomerStage[]> {
  const supabase = await createServerSupabaseClient();
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

export async function listJobsForOrg(orgId: string): Promise<CustomerJob[]> {
  const supabase = await createServerSupabaseClient();
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

export async function listCandidatesForOrg(
  orgId: string
): Promise<CustomerCandidate[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, name, email, linkedin_url, resume_url, note, stage_id, job_id, is_archived, jobs(title, status)"
    )
    .eq("org_id", orgId)
    .eq("is_archived", false);

  if (error) {
    throw new Error(error.message);
  }

  return mapCandidates(data ?? []);
}

export async function createJobForOrg(
  orgId: string,
  payload: CreateJobPayload
) {
  const supabase = await createServerSupabaseClient();
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

export async function updateJobForOrg(
  orgId: string,
  jobId: string,
  payload: UpdateJobPayload
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      title: payload.title,
      status: payload.status ?? "open",
      job_url: payload.jobUrl ?? null,
    })
    .eq("id", jobId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteJobForOrg(orgId: string, jobId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCandidateForOrg(
  orgId: string,
  payload: CreateCandidatePayload
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("candidates").insert({
    org_id: orgId,
    name: payload.name,
    email: payload.email ?? null,
    linkedin_url: payload.linkedinUrl ?? null,
    resume_url: payload.resumeUrl ?? null,
    note: payload.note ?? null,
    stage_id: payload.stageId,
    job_id: payload.jobId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCandidateForOrg(
  orgId: string,
  candidateId: string,
  payload: UpdateCandidatePayload
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("candidates")
    .update({
      name: payload.name,
      email: payload.email ?? null,
      linkedin_url: payload.linkedinUrl ?? null,
      resume_url: payload.resumeUrl ?? null,
      note: payload.note ?? null,
      job_id: payload.jobId,
    })
    .eq("id", candidateId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCandidateStageForOrg(
  orgId: string,
  candidateId: string,
  stageId: string
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("candidates")
    .update({ stage_id: stageId })
    .eq("id", candidateId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function archiveCandidateForOrg(
  orgId: string,
  candidateId: string
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("candidates")
    .update({ is_archived: true })
    .eq("id", candidateId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createStagesForOrg(
  orgId: string,
  stages: StageDraft[]
): Promise<CustomerStage[]> {
  const supabase = await createServerSupabaseClient();
  const payload = stages.map((stage, index) => ({
    org_id: orgId,
    name: stage.name,
    // Use temporary high positions to avoid unique conflicts before reorder.
    position: 1_000_000 + index,
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

  return (data ?? []) as CustomerStage[];
}

export async function updateStagesForOrg(
  orgId: string,
  stages: CustomerStage[]
) {
  const supabase = await createServerSupabaseClient();
  if (stages.length === 0) return;

  const updateResults = await Promise.all(
    stages.map((stage) =>
      supabase
        .from("pipeline_stages")
        .update({ name: stage.name, is_terminal: stage.is_terminal })
        .eq("id", stage.id)
        .eq("org_id", orgId)
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

export async function deleteStageWithCandidatesForOrg(
  orgId: string,
  stageId: string,
  fallbackStageId: string
) {
  const supabase = await createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("candidates")
    .update({ stage_id: fallbackStageId })
    .eq("stage_id", stageId)
    .eq("org_id", orgId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await supabase
    .from("pipeline_stages")
    .delete()
    .eq("id", stageId)
    .eq("org_id", orgId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}
