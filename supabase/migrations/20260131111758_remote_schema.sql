


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."admin_list_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "created_at" timestamp with time zone, "is_active" boolean, "users_count" integer, "jobs_count" integer, "candidates_count" integer, "customer_profile_id" "uuid", "customer_name" "text", "customer_email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  select
    o.id,
    o.name,
    o.created_at,
    o.is_active,
    (select count(*)::int from profiles p where p.org_id = o.id) as users_count,
    (select count(*)::int from jobs j where j.org_id = o.id) as jobs_count,
    (select count(*)::int from candidates c where c.org_id = o.id) as candidates_count,
    pc.id as customer_profile_id,
    pc.full_name as customer_name,
    au.email as customer_email
  from organizations o
  left join lateral (
    select p.id, p.full_name
    from profiles p
    where p.org_id = o.id and p.role = 'customer'
    order by p.created_at asc
    limit 1
  ) pc on true
  left join auth.users au on au.id = pc.id
  where o.name <> 'Internal'
  order by o.created_at desc;
$$;


ALTER FUNCTION "public"."admin_list_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_org"("target_org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    public.is_admin()
    or (
      public.is_active_user()
      and target_org_id = public.current_org_id()
    );
$$;


ALTER FUNCTION "public"."can_access_org"("target_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_org_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select p.org_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;


ALTER FUNCTION "public"."current_org_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_candidate_job_same_org"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.job_id is null then
    return new;
  end if;

  if not exists (
    select 1 from public.jobs j
    where j.id = new.job_id
      and j.org_id = new.org_id
  ) then
    raise exception 'candidate.org_id must match job.org_id';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."ensure_candidate_job_same_org"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_active_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles p
    join public.organizations o on o.id = p.org_id
    where p.id = auth.uid()
      and p.is_active = true
      and o.is_active = true
  );
$$;


ALTER FUNCTION "public"."is_active_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reorder_pipeline_stages"("stage_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  target_org uuid;
  mismatches int;
begin
  if stage_ids is null or array_length(stage_ids, 1) is null then
    return;
  end if;

  select org_id into target_org
  from public.pipeline_stages
  where id = stage_ids[1];

  if target_org is null then
    raise exception 'Invalid stage ids';
  end if;

  if not public.can_access_org(target_org) then
    raise exception 'Not authorized';
  end if;

  select count(*) into mismatches
  from public.pipeline_stages
  where id = any(stage_ids)
    and org_id <> target_org;

  if mismatches > 0 then
    raise exception 'Stages must belong to same org';
  end if;

  -- Step 1: move to temp negative positions (unique and conflict‑free)
  update public.pipeline_stages p
  set position = -s.pos
  from unnest(stage_ids) with ordinality as s(id, pos)
  where p.id = s.id;

  -- Step 2: set final positions
  update public.pipeline_stages p
  set position = s.pos
  from unnest(stage_ids) with ordinality as s(id, pos)
  where p.id = s.id;
end;
$$;


ALTER FUNCTION "public"."reorder_pipeline_stages"("stage_ids" "uuid"[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "job_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text",
    "linkedin_url" "text",
    "stage_id" "uuid" NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."candidates" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text"])))
);

ALTER TABLE ONLY "public"."jobs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."organizations" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pipeline_stages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" DEFAULT "public"."current_org_id"() NOT NULL,
    "name" "text" NOT NULL,
    "position" integer NOT NULL,
    "is_terminal" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."pipeline_stages" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."pipeline_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "full_name" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'customer'::"text"])))
);

ALTER TABLE ONLY "public"."profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_org_id_name_key" UNIQUE ("org_id", "name");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_org_id_position_key" UNIQUE ("org_id", "position");



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "candidates_org_id_idx" ON "public"."candidates" USING "btree" ("org_id");



CREATE INDEX "candidates_org_job_idx" ON "public"."candidates" USING "btree" ("org_id", "job_id");



CREATE INDEX "candidates_org_stage_idx" ON "public"."candidates" USING "btree" ("org_id", "stage_id");



CREATE INDEX "jobs_org_id_idx" ON "public"."jobs" USING "btree" ("org_id");



CREATE UNIQUE INDEX "organizations_unique_active_name_normalized" ON "public"."organizations" USING "btree" ("lower"(TRIM(BOTH FROM "name"))) WHERE ("is_active" = true);



CREATE INDEX "pipeline_stages_org_pos_idx" ON "public"."pipeline_stages" USING "btree" ("org_id", "position");



CREATE UNIQUE INDEX "pipeline_stages_unique_name_per_org" ON "public"."pipeline_stages" USING "btree" ("org_id", "lower"(TRIM(BOTH FROM "name")));



CREATE UNIQUE INDEX "pipeline_stages_unique_position_per_org" ON "public"."pipeline_stages" USING "btree" ("org_id", "position");



CREATE OR REPLACE TRIGGER "trg_candidate_job_same_org" BEFORE INSERT OR UPDATE ON "public"."candidates" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_candidate_job_same_org"();



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pipeline_stages"
    ADD CONSTRAINT "pipeline_stages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE "public"."candidates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "candidates_insert" ON "public"."candidates" FOR INSERT TO "authenticated" WITH CHECK ("public"."can_access_org"("org_id"));



CREATE POLICY "candidates_select" ON "public"."candidates" FOR SELECT TO "authenticated" USING ("public"."can_access_org"("org_id"));



CREATE POLICY "candidates_update" ON "public"."candidates" FOR UPDATE TO "authenticated" USING ("public"."can_access_org"("org_id")) WITH CHECK ("public"."can_access_org"("org_id"));



ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "jobs_insert" ON "public"."jobs" FOR INSERT TO "authenticated" WITH CHECK ("public"."can_access_org"("org_id"));



CREATE POLICY "jobs_select" ON "public"."jobs" FOR SELECT TO "authenticated" USING ("public"."can_access_org"("org_id"));



CREATE POLICY "jobs_update" ON "public"."jobs" FOR UPDATE TO "authenticated" USING ("public"."can_access_org"("org_id")) WITH CHECK ("public"."can_access_org"("org_id"));



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_select" ON "public"."organizations" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR (("id" = "public"."current_org_id"()) AND "public"."is_active_user"())));



CREATE POLICY "organizations_update_admin" ON "public"."organizations" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."pipeline_stages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR (("id" = "auth"."uid"()) AND "public"."is_active_user"())));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR (("id" = "auth"."uid"()) AND "public"."is_active_user"()))) WITH CHECK (("public"."is_admin"() OR (("id" = "auth"."uid"()) AND "public"."is_active_user"() AND ("role" = ( SELECT "p"."role"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"()))) AND ("org_id" = ( SELECT "p"."org_id"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"()))) AND ("is_active" = ( SELECT "p"."is_active"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"()))))));



CREATE POLICY "stages_delete" ON "public"."pipeline_stages" FOR DELETE TO "authenticated" USING ("public"."can_access_org"("org_id"));



CREATE POLICY "stages_insert" ON "public"."pipeline_stages" FOR INSERT TO "authenticated" WITH CHECK ("public"."can_access_org"("org_id"));



CREATE POLICY "stages_select" ON "public"."pipeline_stages" FOR SELECT TO "authenticated" USING ("public"."can_access_org"("org_id"));



CREATE POLICY "stages_update" ON "public"."pipeline_stages" FOR UPDATE TO "authenticated" USING ("public"."can_access_org"("org_id")) WITH CHECK ("public"."can_access_org"("org_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."admin_list_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_list_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_list_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_org"("target_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_org"("target_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_org"("target_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_candidate_job_same_org"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_candidate_job_same_org"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_candidate_job_same_org"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_active_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_pipeline_stages"("stage_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_pipeline_stages"("stage_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_pipeline_stages"("stage_ids" "uuid"[]) TO "service_role";


















GRANT ALL ON TABLE "public"."candidates" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."candidates" TO "authenticated";



GRANT ALL ON TABLE "public"."jobs" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."jobs" TO "authenticated";



GRANT ALL ON TABLE "public"."organizations" TO "service_role";
GRANT SELECT ON TABLE "public"."organizations" TO "authenticated";



GRANT ALL ON TABLE "public"."pipeline_stages" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pipeline_stages" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT,UPDATE ON TABLE "public"."profiles" TO "authenticated";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

revoke delete on table "public"."candidates" from "anon";

revoke insert on table "public"."candidates" from "anon";

revoke references on table "public"."candidates" from "anon";

revoke select on table "public"."candidates" from "anon";

revoke trigger on table "public"."candidates" from "anon";

revoke truncate on table "public"."candidates" from "anon";

revoke update on table "public"."candidates" from "anon";

revoke delete on table "public"."candidates" from "authenticated";

revoke references on table "public"."candidates" from "authenticated";

revoke trigger on table "public"."candidates" from "authenticated";

revoke truncate on table "public"."candidates" from "authenticated";

revoke delete on table "public"."jobs" from "anon";

revoke insert on table "public"."jobs" from "anon";

revoke references on table "public"."jobs" from "anon";

revoke select on table "public"."jobs" from "anon";

revoke trigger on table "public"."jobs" from "anon";

revoke truncate on table "public"."jobs" from "anon";

revoke update on table "public"."jobs" from "anon";

revoke delete on table "public"."jobs" from "authenticated";

revoke references on table "public"."jobs" from "authenticated";

revoke trigger on table "public"."jobs" from "authenticated";

revoke truncate on table "public"."jobs" from "authenticated";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."pipeline_stages" from "anon";

revoke insert on table "public"."pipeline_stages" from "anon";

revoke references on table "public"."pipeline_stages" from "anon";

revoke select on table "public"."pipeline_stages" from "anon";

revoke trigger on table "public"."pipeline_stages" from "anon";

revoke truncate on table "public"."pipeline_stages" from "anon";

revoke update on table "public"."pipeline_stages" from "anon";

revoke references on table "public"."pipeline_stages" from "authenticated";

revoke trigger on table "public"."pipeline_stages" from "authenticated";

revoke truncate on table "public"."pipeline_stages" from "authenticated";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


