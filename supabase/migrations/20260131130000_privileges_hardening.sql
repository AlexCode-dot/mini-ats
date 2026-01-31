-- Privilege hardening: tighten default privileges and function/table access.

-- Default privileges: remove broad grants to anon/authenticated for future objects.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

-- Table grants: explicit allowlist for authenticated, none for anon.
REVOKE ALL ON TABLE "public"."candidates" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."jobs" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."organizations" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."pipeline_stages" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."profiles" FROM "anon", "authenticated";

GRANT SELECT, INSERT, UPDATE ON TABLE "public"."candidates" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON TABLE "public"."jobs" TO "authenticated";
GRANT SELECT ON TABLE "public"."organizations" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."pipeline_stages" TO "authenticated";
GRANT SELECT, UPDATE ON TABLE "public"."profiles" TO "authenticated";

-- Function execution: restrict SECURITY DEFINER and helper functions.
REVOKE ALL ON FUNCTION "public"."admin_list_organizations"() FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."can_access_org"("uuid") FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."current_org_id"() FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."is_active_user"() FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."reorder_pipeline_stages"("uuid"[]) FROM "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."ensure_candidate_job_same_org"() FROM "anon", "authenticated";

GRANT EXECUTE ON FUNCTION "public"."can_access_org"("uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."current_org_id"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_active_user"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."reorder_pipeline_stages"("uuid"[]) TO "authenticated";

-- admin_list_organizations should only be callable by service_role.
GRANT EXECUTE ON FUNCTION "public"."admin_list_organizations"() TO "service_role";
