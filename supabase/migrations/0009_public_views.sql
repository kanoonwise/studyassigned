-- The only things an anonymous visitor can read. Table owners bypass RLS by
-- default (FORCE ROW LEVEL SECURITY is never set), so these views run with
-- the schema owner's rights and expose exactly the columns listed here -
-- never priority_rank, base_score, geo_target or any other admin-only field.

create view public_institutions with (security_invoker = false) as
  select
    aishe_code,
    kind,
    name,
    state,
    district,
    inst_type,
    website,
    affiliating_code,
    affiliating_name,
    calendar_authority_code,
    status
  from institutions;

create view public_authorities with (security_invoker = false) as
  select
    aishe_code,
    name,
    state,
    calendar_url,
    exam_url,
    notice_url,
    status,
    last_checked
  from authorities;

create view public_deadlines with (security_invoker = false) as
  select
    id,
    authority_code,
    event_type,
    exact_date,
    evidence_url,
    verified_at
  from deadlines
  where status = 'verified';

create view public_service_prices with (security_invoker = false) as
  select service, unit, price_low, price_high, note
  from service_prices
  where active = true;

create view public_ugc_levels with (security_invoker = false) as
  select level, min_pct, max_pct, label, consequence, action_window_months
  from ugc_levels;

grant select on public_institutions to anon, authenticated;
grant select on public_authorities to anon, authenticated;
grant select on public_deadlines to anon, authenticated;
grant select on public_service_prices to anon, authenticated;
grant select on public_ugc_levels to anon, authenticated;

-- Base tables stay unreachable for anonymous visitors; only the views above
-- are. `authenticated` keeps its table grants because staff roles (admin,
-- verifier, ops) need them - RLS policies from 0008 do the real restricting.
revoke all on institutions, authorities, deadlines, service_prices, ugc_levels
  from anon;
