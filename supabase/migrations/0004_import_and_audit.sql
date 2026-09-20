-- Import machinery (Phase 3).
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text,
  uploaded_by uuid references profiles (id),
  uploaded_at timestamptz not null default now(),
  state text not null default 'staged' check (state in ('staged', 'approved', 'rejected', 'rolled_back')),
  summary jsonb                 -- counts of new/changed/removed per sheet
);

create table import_staging (
  batch_id uuid not null references import_batches (id) on delete cascade,
  sheet text not null,
  key text not null,
  row jsonb not null,
  primary key (batch_id, sheet, key)
);

create table import_snapshots (   -- previous values, used for rollback
  batch_id uuid not null references import_batches (id) on delete cascade,
  sheet text not null,
  key text not null,
  before jsonb
);

create index import_snapshots_batch_idx on import_snapshots (batch_id);

create table audit_log (
  id bigserial primary key,
  actor uuid references profiles (id),
  action text not null,
  entity text not null,
  entity_key text,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

create index audit_log_entity_idx on audit_log (entity, entity_key);
create index audit_log_actor_idx on audit_log (actor);
