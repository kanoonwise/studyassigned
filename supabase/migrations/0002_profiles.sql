-- One row per auth.users row. Created automatically by the
-- handle_new_user trigger in 0003_helper_functions.sql.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'One row per authenticated user. role drives every RLS policy.';
