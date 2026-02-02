-- Tighten resume storage policies: enforce PDF + size limit at storage layer.

DROP POLICY IF EXISTS "candidate_resumes_read" ON storage.objects;
DROP POLICY IF EXISTS "candidate_resumes_insert" ON storage.objects;
DROP POLICY IF EXISTS "candidate_resumes_update" ON storage.objects;
DROP POLICY IF EXISTS "candidate_resumes_delete" ON storage.objects;

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
  AND coalesce(
    (metadata->>'mimetype')::text,
    (metadata->>'contentType')::text,
    ''
  ) = 'application/pdf'
  AND coalesce((metadata->>'size')::int, 0) <= 10485760
);

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
  AND coalesce(
    (metadata->>'mimetype')::text,
    (metadata->>'contentType')::text,
    ''
  ) = 'application/pdf'
  AND coalesce((metadata->>'size')::int, 0) <= 10485760
);

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
