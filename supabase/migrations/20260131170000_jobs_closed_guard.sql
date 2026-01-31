-- Prevent assigning closed jobs to new or moved candidates.

CREATE OR REPLACE FUNCTION "public"."ensure_candidate_job_open"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.job_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Allow updates that don't change job_id (e.g. edit name/email on existing candidate).
  IF TG_OP = 'UPDATE' AND OLD.job_id IS NOT NULL AND NEW.job_id = OLD.job_id THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = NEW.job_id
      AND j.status = 'closed'
  ) THEN
    RAISE EXCEPTION 'cannot assign candidates to closed jobs';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_candidate_job_open" ON "public"."candidates";
CREATE TRIGGER "trg_candidate_job_open"
BEFORE INSERT OR UPDATE ON "public"."candidates"
FOR EACH ROW EXECUTE FUNCTION "public"."ensure_candidate_job_open"();
