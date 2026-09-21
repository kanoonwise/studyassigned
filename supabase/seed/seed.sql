-- Reference data the public site reads through public_service_prices and
-- public_ugc_levels. Run with `supabase db seed` (or included automatically
-- by `supabase db reset`) against a project the migrations have already run
-- against.

-- UGC (Promotion of Academic Integrity and Prevention of Plagiarism)
-- Regulations 2018 levels, exactly as BUILD_SPEC.md Section 5 (Phase 2)
-- specifies them. NOT LEGAL ADVICE - the spec is explicit that a lawyer
-- must verify these against the regulation text before launch.
insert into ugc_levels (level, min_pct, max_pct, label, consequence, action_window_months, source_note)
values
  (0, 0, 10, 'Level 0', 'No penalty.', null,
   'DRAFT pending lawyer verification against UGC Regulations 2018, see BUILD_SPEC.md Section 9.4'),
  (1, 10, 40, 'Level 1', 'Revise and resubmit within a set period (maximum 6 months).', 6,
   'DRAFT pending lawyer verification against UGC Regulations 2018, see BUILD_SPEC.md Section 9.4'),
  (2, 40, 60, 'Level 2', 'Barred from submitting a revised thesis for one year.', 12,
   'DRAFT pending lawyer verification against UGC Regulations 2018, see BUILD_SPEC.md Section 9.4'),
  (3, 60, null, 'Level 3', 'PhD registration may be cancelled; UG/PG suspension.', null,
   'DRAFT pending lawyer verification against UGC Regulations 2018, see BUILD_SPEC.md Section 9.4')
on conflict (level) do update set
  min_pct = excluded.min_pct, max_pct = excluded.max_pct, label = excluded.label,
  consequence = excluded.consequence, action_window_months = excluded.action_window_months,
  source_note = excluded.source_note;

-- Services & Pricing: PLACEHOLDER ranges so the Services page and Instant
-- Quote calculator are demonstrably functional end-to-end. These are not a
-- business decision - BUILD_SPEC.md Section 9.2 flags real pricing as
-- undecided (the sheet says INR 0.28-0.45/word, a separate market report
-- says INR 2.00-5.00/word). Edit or deactivate these from the admin Prices
-- page (Phase 3) before this ever reaches a real visitor. DrillBit/
-- Turnitin-adjacent checks stay out entirely per Section 9.3 until legal
-- sign-off; they are not listed here at all.
insert into service_prices (service, unit, price_low, price_high, active, note)
values
  ('Similarity/AI report explanation', 'per_doc', 499, 1499, true, 'Indicative range - confirm with our team'),
  ('Citation and reference formatting', 'per_page', 40, 90, true, 'Indicative range - confirm with our team'),
  ('Author-led revision editing', 'per_word', 0.28, 0.45, true, 'Indicative range - confirm with our team'),
  ('Mentoring session (60 min)', 'per_project', 999, 2499, true, 'Indicative range - confirm with our team')
on conflict (service) do update set
  unit = excluded.unit, price_low = excluded.price_low, price_high = excluded.price_high,
  active = excluded.active, note = excluded.note;
