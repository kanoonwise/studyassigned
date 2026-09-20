No static `seed.sql` here yet - there's nothing safe to seed as SQL. The one
Phase 0 bootstrap step (creating the first admin) has to go through Supabase
Auth, not a plain insert, so it's `../../scripts/seed-admin.ts` instead.

Reference data with real content decisions attached (`service_prices`,
`ugc_levels`) is deliberately left unseeded here - see BUILD_SPEC.md Section 9
questions 2 and 4. Phase 1/2 add real seed rows once those are answered.
