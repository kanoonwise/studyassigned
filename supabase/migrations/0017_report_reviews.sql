-- Similarity Report Decoder (Phase 6): a student requests a structured
-- breakdown of a report they've already uploaded to /account; a reviewer
-- (admin/ops) fills it in. Manual only for now, per BUILD_SPEC.md Section
-- 5 ("Automate parsing only after the manual version works").
create table report_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  student_id uuid not null references profiles (id),
  reviewer_id uuid references profiles (id),
  status text not null default 'requested' check (status in ('requested', 'in_review', 'completed')),
  top_sources text,
  references_vs_overlap text,
  self_plagiarism text,
  first_fixes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index report_reviews_student_idx on report_reviews (student_id);
create index report_reviews_status_idx on report_reviews (status);

alter table report_reviews enable row level security;

create policy report_reviews_student_select on report_reviews for select
  using (student_id = auth.uid());
create policy report_reviews_student_insert on report_reviews for insert
  with check (student_id = auth.uid());
create policy report_reviews_staff_all on report_reviews for all
  using (public.current_user_role() in ('admin', 'ops'))
  with check (public.current_user_role() in ('admin', 'ops'));

grant select, insert, update, delete on report_reviews to authenticated;
