-- Actual vs forecast dashboard (Phase 6, admin-only). Plan vs actual by
-- month per metric (leads, orders, revenue, ...), plus a monthly campaign
-- checklist. Geo-target export reuses institutions.geo_target /
-- inner_km / outer_km, already in Section 3's schema - no new table for
-- that. None of this is ever readable outside admin.
create table admin_actuals (
  id bigint generated always as identity primary key,
  month date not null,
  metric text not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (month, metric)
);

create table admin_forecasts (
  id bigint generated always as identity primary key,
  month date not null,
  metric text not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (month, metric)
);

create table campaign_checklist_items (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  item text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index admin_actuals_month_idx on admin_actuals (month);
create index admin_forecasts_month_idx on admin_forecasts (month);
create index campaign_checklist_month_idx on campaign_checklist_items (month);

alter table admin_actuals enable row level security;
alter table admin_forecasts enable row level security;
alter table campaign_checklist_items enable row level security;

create policy admin_actuals_admin_all on admin_actuals for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy admin_forecasts_admin_all on admin_forecasts for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
create policy campaign_checklist_admin_all on campaign_checklist_items for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

grant select, insert, update, delete on admin_actuals to authenticated;
grant select, insert, update, delete on admin_forecasts to authenticated;
grant select, insert, update, delete on campaign_checklist_items to authenticated;
