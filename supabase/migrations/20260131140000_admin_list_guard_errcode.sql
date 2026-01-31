-- Use permission denied errcode for admin_list_organizations guard.
-- Also align function EXECUTE privileges with manual hotfixes.

CREATE OR REPLACE FUNCTION "public"."admin_list_organizations"()
RETURNS TABLE(
  "id" "uuid",
  "name" "text",
  "created_at" timestamp with time zone,
  "is_active" boolean,
  "users_count" integer,
  "jobs_count" integer,
  "candidates_count" integer,
  "customer_profile_id" "uuid",
  "customer_name" "text",
  "customer_email" "text"
)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public', 'auth'
AS $$
DECLARE
  jwt_role text := coalesce(auth.role(), current_setting('request.jwt.claim.role', true));
BEGIN
  IF jwt_role IS DISTINCT FROM 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.created_at,
    o.is_active,
    (SELECT count(*)::int FROM profiles p WHERE p.org_id = o.id) AS users_count,
    (SELECT count(*)::int FROM jobs j WHERE j.org_id = o.id) AS jobs_count,
    (SELECT count(*)::int FROM candidates c WHERE c.org_id = o.id) AS candidates_count,
    pc.id AS customer_profile_id,
    pc.full_name AS customer_name,
    au.email AS customer_email
  FROM organizations o
  LEFT JOIN LATERAL (
    SELECT p.id, p.full_name
    FROM profiles p
    WHERE p.org_id = o.id AND p.role = 'customer'
    ORDER BY p.created_at ASC
    LIMIT 1
  ) pc ON true
  LEFT JOIN auth.users au ON au.id = pc.id
  WHERE o.name <> 'Internal'
  ORDER BY o.created_at DESC;
END;
$$;

ALTER FUNCTION "public"."admin_list_organizations"() OWNER TO "postgres";

-- Function EXECUTE hardening (match the manual SQL you already ran).
REVOKE ALL ON FUNCTION public.admin_list_organizations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_org(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_org_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_active_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reorder_pipeline_stages(uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_organizations() TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_pipeline_stages(uuid[]) TO authenticated;
