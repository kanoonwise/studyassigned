-- Campus referral tracking (Phase 6, admin-only marketing data). A campus
-- ambassador gets a short code; visits and enquiries carrying it are
-- attributed for internal reporting. Never shown to the public - the
-- codes list and per-code counts are staff-only, same as leads.
create table referral_codes (
  code text primary key,
  owner_name text not null,
  institution_code text references institutions (aishe_code),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table leads add column referral_code text;

alter table referral_codes enable row level security;

create policy referral_codes_staff_all on referral_codes for all
  using (public.current_user_role() in ('admin', 'ops'))
  with check (public.current_user_role() in ('admin', 'ops'));

grant select, insert, update, delete on referral_codes to authenticated;
