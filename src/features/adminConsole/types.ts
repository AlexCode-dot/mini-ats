export type AdminOrgRow = {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
  users_count: number;
  jobs_count: number;
  candidates_count: number;
  customer_profile_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
};

export type AdminAdminRow = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
};

export type CreateOrganizationPayload = {
  orgName: string;
  customerEmail: string;
  customerName?: string;
  password: string;
};

export type CreateOrganizationResponse = {
  organization: AdminOrgRow;
  customerProfile: {
    id: string;
    email: string;
    full_name: string | null;
    org_id: string;
  };
};

export type CreateAdminPayload = {
  email: string;
  name?: string;
  password: string;
};

export type CreateAdminResponse = {
  admin: AdminAdminRow;
};

export type UpdateOrganizationPayload = {
  orgId: string;
  orgName: string;
  customerName?: string;
  customerEmail: string;
  profileId: string;
};

export type UpdateOrganizationResponse = {
  organization: AdminOrgRow;
};

export type AdminOrgSummary = {
  users_count: number;
  jobs_count: number;
  candidates_count: number;
};

export type AdminStage = {
  id: string;
  name: string;
  position: number;
  is_terminal: boolean;
};

export type AdminCandidate = {
  id: string;
  name: string;
  email: string | null;
  stage_id: string;
  stage_name: string;
  stage_position: number;
  job_title: string | null;
};

export type AdminJob = {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
};

export type AdminCandidatesResponse = {
  stages: AdminStage[];
  candidates: AdminCandidate[];
};
