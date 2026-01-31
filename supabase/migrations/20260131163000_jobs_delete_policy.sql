-- Allow authenticated users to delete jobs in their org.

GRANT DELETE ON TABLE "public"."jobs" TO "authenticated";

DROP POLICY IF EXISTS "jobs_delete" ON "public"."jobs";
CREATE POLICY "jobs_delete" ON "public"."jobs"
  FOR DELETE TO "authenticated"
  USING ("public"."can_access_org"("org_id"));
