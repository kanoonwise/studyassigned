-- Config, editable by admin. The site never hard-codes a price or threshold.
create table service_prices (
  id serial primary key,
  service text not null,
  unit text not null check (unit in ('per_word', 'per_page', 'per_doc', 'per_project')),
  price_low numeric,
  price_high numeric,
  active boolean not null default true,
  note text
);

create table ugc_levels (
  level int primary key,
  min_pct numeric not null,
  max_pct numeric,
  label text not null,
  consequence text not null,
  action_window_months int,
  source_note text
);

-- Leads and free-tool usage.
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  institution_code text references institutions (aishe_code),
  level text,
  message text,
  source text,
  consent_at timestamptz not null,
  flagged boolean not null default false,
  flag_reason text
);

create index leads_institution_idx on leads (institution_code);
create index leads_flagged_idx on leads (flagged);

create table tool_events (
  id bigserial primary key,
  tool text not null,
  at timestamptz not null default now(),
  inputs jsonb,
  lead_id uuid references leads (id)
);

create table deadline_alerts (
  id uuid primary key default gen_random_uuid(),
  institution_code text references institutions (aishe_code),
  contact text not null,
  consent_at timestamptz not null,
  notified_at timestamptz
);

create index deadline_alerts_institution_idx on deadline_alerts (institution_code);
