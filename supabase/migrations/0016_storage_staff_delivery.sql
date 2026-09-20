-- Ops/admin upload a delivery file into the student's own folder (so the
-- student can read it back via their own documents_bucket_owner_all
-- policy) - that needs its own INSERT grant, since the owner-folder policy
-- only lets a user write into their own folder.
create policy documents_bucket_staff_insert on storage.objects for insert
  with check (bucket_id = 'documents' and public.current_user_role() in ('admin', 'ops'));
