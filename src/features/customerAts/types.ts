export type CustomerStage = {
  id: string;
  name: string;
  position: number;
  is_terminal: boolean;
};

export type CustomerCandidate = {
  id: string;
  name: string;
  email: string | null;
  linkedin_url: string | null;
  stage_id: string;
  job_id: string | null;
  job_title: string | null;
};

export type CustomerJob = {
  id: string;
  title: string;
  status: string | null;
  job_url: string | null;
  created_at: string;
};

export type CreateJobPayload = {
  title: string;
  status?: string | null;
  jobUrl?: string | null;
};

export type UpdateJobPayload = {
  title: string;
  status?: string | null;
  jobUrl?: string | null;
};

export type CreateCandidatePayload = {
  name: string;
  jobId: string;
  email?: string | null;
  linkedinUrl?: string | null;
  stageId: string;
};

export type UpdateCandidatePayload = {
  name: string;
  jobId: string;
  email?: string | null;
  linkedinUrl?: string | null;
};

export type StageDraft = CustomerStage & {
  isNew?: boolean;
  isDeleted?: boolean;
};
