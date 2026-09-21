-- Writing Proof Vault (Phase 6): every uploaded draft is already
-- timestamped and hashed (documents.uploaded_at / documents.sha256, from
-- Phase 5). This adds the grouping so a student can build a version
-- timeline for one piece of writing and export it as evidence. It is
-- supporting evidence of authorship over time, never proof of originality
-- or a guaranteed outcome - the report text says so explicitly.
create table vault_projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references profiles (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index vault_projects_owner_idx on vault_projects (owner);

alter table documents add column vault_project_id uuid references vault_projects (id) on delete set null;
alter table documents add column version_label text;

alter table vault_projects enable row level security;

create policy vault_projects_owner_all on vault_projects for all
  using (owner = auth.uid())
  with check (owner = auth.uid());
create policy vault_projects_staff_select on vault_projects for select
  using (public.current_user_role() in ('admin', 'ops'));

grant select, insert, update, delete on vault_projects to authenticated;
