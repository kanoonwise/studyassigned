`seed.sql` seeds `ugc_levels` (Phase 2) and `service_prices` (Phase 1) with
placeholder content, since both pages need real rows to be demonstrably
functional. Neither is a real business/legal decision:

- `ugc_levels` uses the exact figures BUILD_SPEC.md Section 5 specifies,
  each flagged `DRAFT pending lawyer verification` in `source_note` (see
  Section 9.4). Don't remove that flag without an actual legal sign-off.
- `service_prices` uses indicative placeholder ranges. See BUILD_SPEC.md
  Section 9.2 - real pricing is still an open business decision. Edit or
  deactivate these from the admin Prices page (Phase 3) before a real
  visitor sees them.

Apply it with `supabase db seed` (or automatically via `supabase db reset`)
after the migrations have run. Re-running it is safe - both inserts upsert
by their natural key.

The one Phase 0 bootstrap step (creating the first admin) goes through
Supabase Auth, not a plain insert, so it's `../../scripts/seed-admin.ts`
instead of a row here.
