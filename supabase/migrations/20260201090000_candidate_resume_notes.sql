-- Add resume + note fields to candidates and secure storage for resumes.

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS note text;

-- Storage bucket for candidate resumes.
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-resumes', 'candidate-resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow access for same org or admins.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'candidate_resumes_read'
  ) THEN
    CREATE POLICY "candidate_resumes_read"
    ON storage.objects
    FOR SELECT
    TO authenticated, service_role
    USING (
      bucket_id = 'candidate-resumes'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = public.current_org_id()::text
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'candidate_resumes_insert'
  ) THEN
    CREATE POLICY "candidate_resumes_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated, service_role
    WITH CHECK (
      bucket_id = 'candidate-resumes'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = public.current_org_id()::text
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'candidate_resumes_update'
  ) THEN
    CREATE POLICY "candidate_resumes_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated, service_role
    USING (
      bucket_id = 'candidate-resumes'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = public.current_org_id()::text
      )
    )
    WITH CHECK (
      bucket_id = 'candidate-resumes'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = public.current_org_id()::text
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'candidate_resumes_delete'
  ) THEN
    CREATE POLICY "candidate_resumes_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated, service_role
    USING (
      bucket_id = 'candidate-resumes'
      AND (
        public.is_admin()
        OR (storage.foldername(name))[1] = public.current_org_id()::text
      )
    );
  END IF;
END $$;
