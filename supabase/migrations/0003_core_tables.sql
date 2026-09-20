-- Institutions (Active 8K): key = AISHE code, e.g. C-46831, U-0549
create table institutions (
  aishe_code text primary key,
  kind text not null check (kind in ('College', 'University')),
  name text not null,
  state text not null,
  district text,
  address text,
  website text,
  inst_type text,
  management text,
  affiliating_code text,        -- U-xxxx
  affiliating_name text,
  urban_rural text,
  established int,
  calendar_authority_code text, -- which authority's calendar applies
  status deadline_status not null default 'manual_required',
  last_checked date,
  -- admin-only fields (never in public views):
  priority_rank int,
  base_score numeric,
  geo_target text,
  maps_url text,
  inner_km numeric,
  outer_km numeric,
  updated_at timestamptz not null default now()
);

create index institutions_state_idx on institutions (state);
create index institutions_status_idx on institutions (status);
create index institutions_name_trgm_idx on institutions using gin (name gin_trgm_ops);

-- Calendar authorities (one row per university / calendar authority)
create table authorities (
  aishe_code text primary key,
  name text not null,
  state text,
  active_covered int,           -- how many active institutions it covers
  calendar_url text,
  exam_url text,
  notice_url text,
  link_confidence text check (link_confidence in ('High', 'Medium', 'Low')),
  status deadline_status not null default 'manual_required',
  last_checked date,
  next_refresh text,
  owner text
);

alter table institutions
  add constraint institutions_calendar_authority_fkey
  foreign key (calendar_authority_code) references authorities (aishe_code);

-- Dated events. Only rows with status='verified' are ever shown with a date.
create table deadlines (
  id uuid primary key default gen_random_uuid(),
  authority_code text references authorities (aishe_code),
  event_type text not null,     -- e.g. 'Mid-semester examination window begins'
  exact_date date,
  status deadline_status not null,
  evidence_url text,
  verified_by uuid references profiles (id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index deadlines_authority_idx on deadlines (authority_code);
create index deadlines_status_idx on deadlines (status);

create table verification_tasks (
  id uuid primary key default gen_random_uuid(),
  authority_code text references authorities (aishe_code),
  next_action text,
  owner uuid references profiles (id),
  state text not null default 'open' check (state in ('open', 'in_progress', 'done')),
  updated_at timestamptz not null default now()
);

create index verification_tasks_authority_idx on verification_tasks (authority_code);
create index verification_tasks_owner_idx on verification_tasks (owner);
