-- Explicit table grants so this schema behaves the same on a plain Postgres
-- test database as it does on Supabase (which pre-configures equivalent
-- defaults for anon/authenticated at the platform level). RLS policies from
-- 0008 do the actual restricting; these grants only decide who may attempt
-- a statement at all.

grant usage on schema public to anon, authenticated;

-- authenticated: every app table. RLS narrows this to "own row" or "staff only".
grant select, insert, update, delete on
  profiles, institutions, authorities, deadlines, verification_tasks,
  import_batches, import_staging, import_snapshots, audit_log,
  service_prices, ugc_levels, leads, tool_events, deadline_alerts,
  orders, order_events, payments, documents, reviews
  to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- anon: only what a public form needs to write, plus the public_* views
-- (granted in 0009). No anonymous session ever reads a base table directly.
grant insert on leads, tool_events, deadline_alerts to anon;
