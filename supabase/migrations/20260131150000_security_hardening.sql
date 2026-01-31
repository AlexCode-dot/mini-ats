-- Security hardening: enforce stage/org integrity for candidates.
-- Note: default privileges for supabase_admin require elevated role and must be handled separately.

-- Ensure candidate.stage_id belongs to the same org as candidate.org_id.
CREATE OR REPLACE FUNCTION "public"."ensure_candidate_stage_same_org"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stage_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.pipeline_stages s
    WHERE s.id = NEW.stage_id
      AND s.org_id = NEW.org_id
  ) THEN
    RAISE EXCEPTION 'candidate.org_id must match stage.org_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_candidate_stage_same_org" ON "public"."candidates";
CREATE TRIGGER "trg_candidate_stage_same_org"
BEFORE INSERT OR UPDATE ON "public"."candidates"
FOR EACH ROW EXECUTE FUNCTION "public"."ensure_candidate_stage_same_org"();
