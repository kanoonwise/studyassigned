-- Private bucket for student document uploads. No public URL - every read
-- goes through a signed URL generated server-side after an RLS/ownership
-- check, per BUILD_SPEC.md Phase 5.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Objects are stored at documents/{owner_uuid}/{filename}. A user may only
-- read/write/delete within their own folder; staff (admin/ops) and an
-- order's assigned mentor may also read.
create policy documents_bucket_owner_all on storage.objects for all
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy documents_bucket_staff_select on storage.objects for select
  using (bucket_id = 'documents' and public.current_user_role() in ('admin', 'ops'));

create policy documents_bucket_mentor_select on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from documents d
      join orders o on o.id = d.order_id
      where d.path = storage.objects.name and o.mentor_id = auth.uid()
    )
  );
