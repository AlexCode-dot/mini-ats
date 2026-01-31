-- Add optional job posting URL to jobs.

ALTER TABLE "public"."jobs"
  ADD COLUMN IF NOT EXISTS "job_url" text;
