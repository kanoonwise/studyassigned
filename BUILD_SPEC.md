# Website Build Spec: India Academic Support Platform

Version 1.0 · 20 Sep 2026 · For Claude Code · All phases combined

---

## 0. How to use this with Claude Code

1. Create a new empty repo. Put this file in the root as `BUILD_SPEC.md`.
2. Copy **Section 1 (Standing rules)** into a file called `CLAUDE.md` in the repo root, so it is read every session.
3. Put `StudyAssigned_Deep_Institution_Intelligence_2026_27_FINAL.xlsx` in `/fixtures`. (The Master Revenue Forecast workbook is an exact subset of it, so it is not needed.)
4. Start Claude Code in **plan mode** and paste this kickoff prompt:

```
Read BUILD_SPEC.md fully. Summarise the plan back to me in 10 lines and list any
questions from Section 9. Then build Phase 0 only.
After each phase: run all tests, list what you built, list every decision you made
that the spec did not cover, and STOP. Do not start the next phase until I say
"go phase N".
```

5. Between phases: review, test on the staging URL, then say "go phase N".

---

## 1. Standing rules (copy into CLAUDE.md)

### Product

A website for students and researchers in India that helps them **understand their similarity and AI reports, meet their institution's deadlines, and get editing and mentoring while they write their own work.** The team runs a backend admin dashboard to upload and download Excel data files and manage an institution database. Students select their institution and see its deadlines and related details.

### Non-negotiable content and product rules

- The student always writes their own work. **Never build or write copy for**: ghostwriting, writing a thesis or assignment for submission, tools that rewrite text to lower a similarity or AI-detection score, fake data or fake references, exam help, or unauthorised access to originality-checking tools.
- **Banned phrases** in any site copy, ad copy, page title or meta tag: "plagiarism removal", "AI removal", "remove AI", "bypass", "Turnitin bypass", "100% human", "humanize", "guaranteed", "guarantee" (in the sense of marks, approval, publication, or a similarity or AI score), "we write your thesis", "write my assignment". Use instead: "originality review", "citation improvement", "report explanation", "editing", "guidance", "author-led revision".
- Add a script `npm run copy-lint` that scans `/app`, `/components`, `/content` for banned phrases and **fails the build** if any are found (allow-list only the Integrity Policy page, where refusals are explained).
- No fear-based or shaming copy, no fake countdowns or fake scarcity.
- Every tool result and deadline page shows a short note: "Informational only. Your institution's own rules and official notices apply."
- **A deadline date is shown as fact only if its status is `verified`.** Everything else is shown as a link plus a "not verified by us yet" label.
- Prices are never hard-coded. They come from the `service_prices` table so the team can edit them.

### Engineering rules

- TypeScript strict mode. No `any` unless commented.
- All calculator logic lives in pure functions in `/lib/tools` with unit tests. Thresholds come from config tables, not constants in components.
- Row Level Security (RLS) on every table. Default deny. The public site reads only through public views.
- Never expose admin-only columns (scores, forecasts, spend, geo-targeting) to public queries.
- Every admin write goes to `audit_log` (who, what, before, after, when).
- Small commits, one feature per commit, conventional commit messages.
- Keep it lean: managed services only, no servers to maintain, no microservices, no extra queues.

---

## 2. Stack and repo layout

**Stack:** Next.js (App Router) + TypeScript + Tailwind · Supabase (Postgres, Auth, Storage, RLS) · Razorpay · Resend (email) · Cloudflare Turnstile (form spam protection) · Vercel hosting · Vitest (unit tests) · Playwright (end-to-end tests) · ExcelJS or SheetJS for spreadsheets.

**Environments:** `staging` and `production`, separate Supabase projects.

```
/app
  (public)/            home, services, pricing, how-it-works, integrity, faq, contact,
                       terms, privacy, tools/*, universities/*
  (student)/           account, orders, documents
  (admin)/             dashboard, imports, exports, verification, institutions,
                       leads, orders, prices, users, audit
  api/                 webhooks (razorpay), forms, cron
/components
/lib
  tools/               ugc-level.ts, resubmission.ts, quote.ts, timeline.ts, disclosure.ts
  import/              parse-workbook.ts, map-*.ts, diff.ts
  db/                  typed queries
/content               page copy (linted)
/supabase
  migrations/
  seed/
/fixtures              workbook + small test workbooks
/tests
```

**Environment variables:** `NEXT_PUBLIC_SITE_NAME` (the workbooks say "StudyAssigned"; confirm), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `WHATSAPP_NUMBER` (for wa.me links).

---

## 3. Data model (Postgres)

Roles: `admin`, `verifier`, `ops`, `mentor`, `student`. Stored in `profiles.role`.

```sql
create type deadline_status as enum
  ('verified','link_found','proxy','seasonality_only','manual_required');

-- Institutions (Active 8K): key = AISHE code, e.g. C-46831, U-0549
create table institutions (
  aishe_code text primary key,
  kind text not null check (kind in ('College','University')),
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
  priority_rank int, base_score numeric, geo_target text, maps_url text,
  inner_km numeric, outer_km numeric,
  updated_at timestamptz default now()
);

-- Calendar authorities (one row per university / calendar authority)
create table authorities (
  aishe_code text primary key,
  name text not null,
  state text,
  active_covered int,           -- how many active institutions it covers
  calendar_url text, exam_url text, notice_url text,
  link_confidence text check (link_confidence in ('High','Medium','Low')),
  status deadline_status not null default 'manual_required',
  last_checked date, next_refresh text, owner text
);

-- Dated events. Only rows with status='verified' are ever shown with a date.
create table deadlines (
  id uuid primary key default gen_random_uuid(),
  authority_code text references authorities(aishe_code),
  event_type text not null,     -- e.g. 'Mid-semester examination window begins'
  exact_date date,
  status deadline_status not null,
  evidence_url text,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  created_at timestamptz default now()
);

create table verification_tasks (
  id uuid primary key default gen_random_uuid(),
  authority_code text references authorities(aishe_code),
  next_action text, owner uuid references profiles(id),
  state text default 'open' check (state in ('open','in_progress','done')),
  updated_at timestamptz default now()
);

-- Import machinery
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text, uploaded_by uuid, uploaded_at timestamptz default now(),
  state text default 'staged' check (state in ('staged','approved','rejected','rolled_back')),
  summary jsonb                 -- counts of new/changed/removed per sheet
);
create table import_staging (
  batch_id uuid references import_batches(id) on delete cascade,
  sheet text, key text, row jsonb, primary key (batch_id, sheet, key)
);
create table import_snapshots (   -- previous values, used for rollback
  batch_id uuid references import_batches(id), sheet text, key text, before jsonb
);
create table audit_log (
  id bigserial primary key, actor uuid, action text, entity text, entity_key text,
  before jsonb, after jsonb, at timestamptz default now()
);

-- Config (editable by admin)
create table service_prices (
  id serial primary key, service text, unit text,     -- per_word|per_page|per_doc|per_project
  price_low numeric, price_high numeric, active bool default true, note text
);
create table ugc_levels (
  level int primary key, min_pct numeric, max_pct numeric,
  label text, consequence text, action_window_months int, source_note text
);

-- Leads and tools
create table leads (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  name text, email text, phone text, institution_code text, level text, message text,
  source text, consent_at timestamptz not null, flagged bool default false, flag_reason text
);
create table tool_events (id bigserial primary key, tool text, at timestamptz default now(), inputs jsonb, lead_id uuid);
create table deadline_alerts (id uuid primary key default gen_random_uuid(), institution_code text, contact text, consent_at timestamptz not null, notified_at timestamptz);

-- Orders (Phase 5+)
create table orders (
  id uuid primary key default gen_random_uuid(), student_id uuid, service text, quote numeric,
  status text check (status in ('submitted','screened','quoted','paid_part','in_progress','delivered','closed','refunded','declined')),
  mentor_id uuid, due_date date, created_at timestamptz default now()
);
create table order_events (id bigserial primary key, order_id uuid, event text, at timestamptz default now(), by uuid);
create table payments (id uuid primary key default gen_random_uuid(), order_id uuid, razorpay_order_id text unique, razorpay_payment_id text unique, amount numeric, status text, milestone text);
create table documents (id uuid primary key default gen_random_uuid(), owner uuid, order_id uuid, path text, sha256 text, uploaded_at timestamptz default now(), delete_after date);
create table reviews (id uuid primary key default gen_random_uuid(), order_id uuid unique, rating int, body text, published bool default false);
```

**Public views** (the only thing anonymous users can read): `public_institutions` (code, name, state, district, type, website, affiliating name, status), `public_authorities` (name, calendar/exam/notice URLs, status, last_checked), `public_deadlines` (verified rows only).

---

## 4. Workbook import mapping

Source file: `StudyAssigned_Deep_Institution_Intelligence_2026_27_FINAL.xlsx`.

**Parsing rules**

- Rows 1 to 3 are merged title rows. **Find the header row by locating the cell that equals `AISHE Code` (or the sheet's first header), not by fixed row number.** In the current file it is row 5 and data starts at row 6.
- Trim whitespace. Treat empty strings as null. Dates like `16 Aug 2026` are strings and must be parsed; `Exact Next Date` / `Exact Date` are real Excel dates.
- Key for upsert: `AISHE Code` (institutions) and `Authority AISHE Code` (authorities).

| Sheet                                                                                                             | Rows          | Goes to                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active 8K Intelligence                                                                                            | 8,000         | `institutions` (+ deadline fields) | 28 columns: Priority Rank, AISHE Code, Kind, Institution, State / UT, District, Address, Website, Institution Type, Management, Affiliating Univ. Code, Affiliating University, Urban / Rural, Established, Base Opportunity Score, Calendar Authority, Academic Calendar URL, Exam / Notice URL, Link Confidence, Deadline Status, Exact Next Date, Deadline Type, Evidence URL, Geo Target, Google Maps Search, Inner/Outer Radius km, Last Checked |
| Deadline Tracker                                                                                                  | 1,427         | `authorities` + `deadlines`        | Queue Rank, Authority AISHE Code, Calendar Authority, State, Active 8K Covered, Calendar/Exam/Notice URL, Deadline Status, Exact Date, Deadline / Submission Type, Evidence URL, Link Confidence, Last Checked, Next Refresh, Owner                                                                                                                                                                                                                   |
| Verification Queue                                                                                                | 1,427         | `verification_tasks`               | Next Action, Owner, Discovery Status                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Services & Pricing                                                                                                | 6             | `service_prices`                   | Some rows have text ("custom") instead of a price; import as null and flag for admin                                                                                                                                                                                                                                                                                                                                                                  |
| Institution Universe                                                                                              | 39 states     | `state_coverage` (small table)     | Title cell has a typo ("142753,836"); official total is 55,263. Ignore the title                                                                                                                                                                                                                                                                                                                                                                      |
| Model Rules                                                                                                       | state density | admin-only, optional               | Not needed for the public site                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Geo Targeting, 8K Month Matrix, monthly tabs, Command Center, Actuals Input, Creative Library, Monthly Psychology | –             | **Admin-only, Phase 6**            | Never public                                                                                                                                                                                                                                                                                                                                                                                                                                          |

**Status mapping** (sheet text to enum)

| Sheet text                                                         | Enum               |
| ------------------------------------------------------------------ | ------------------ |
| Exact official academic window verified                            | `verified`         |
| Official calendar link discovered — verify date / — verify content | `link_found`       |
| Affiliating university proxy / manual verification                 | `proxy`            |
| Seasonality only — no exact date                                   | `seasonality_only` |
| Manual official-site verification required                         | `manual_required`  |

**Import flow (Phase 3)**

1. Admin selects the xlsx. It is parsed **in the browser**, so there are no server timeouts.
2. Validate: required sheets exist, header row found, required columns present, AISHE codes are unique, statuses are in the mapping. Show errors with sheet and row number.
3. Send rows in chunks of 500 to `import_staging`.
4. A SQL function computes the diff against live tables: **new / changed / removed** per sheet, and shows the changed fields. Rows the workbook marks `verified` must not silently overwrite a newer `verified` date entered in the dashboard. Show those as conflicts for the admin to choose.
5. Admin clicks Approve. Everything applies in one transaction; the previous values go to `import_snapshots`.
6. **Rollback** restores a whole batch from `import_snapshots`.
7. **Export** writes the live data back into the **same sheet names and header layout**, so the team can keep working in Excel. Also offer filtered CSV (state, status, owner).

---

## 5. Phases

Do one phase at a time. Each phase ends with its acceptance checks. Stop and wait for review.

### Phase 0: Foundations

- [ ] Repo, Next.js + TypeScript + Tailwind, ESLint, Prettier, Vitest, Playwright.
- [ ] Two Supabase projects (staging, production) with migrations from Section 3; RLS enabled on all tables.
- [ ] Auth with email OTP; `profiles` table with roles; seed one admin.
- [ ] Vercel deploy from `main` (production) and `develop` (staging). Environment variables set.
- [ ] `copy-lint` script wired into CI.
- [ ] Cloudflare Turnstile helper for forms. Basic rate limiting on form endpoints.
- **Accept:** CI is green; staging URL loads; an admin can log in; a non-admin cannot open `/admin`.

### Phase 1: Public site

- [ ] Layout, mobile-first design, header, footer, WhatsApp button (`wa.me` link) on every page.
- [ ] Pages: Home, Services and Pricing, How It Works, Integrity Policy, FAQ, Contact, Terms, Privacy. Copy goes in `/content` (linted). Draft copy following the banned-phrase rules; mark legal pages `DRAFT: lawyer review needed`.
- [ ] Services page reads from `service_prices`. Prices show as ranges with "final quote after review".
- [ ] Enquiry form: name, email/phone, institution (optional), service, message, **consent checkbox** (required, stored in `consent_at`). Saves to `leads`, emails the team, shows a confirmation.
- [ ] Intake screening on the form: keyword and pattern check for prohibited requests (write my thesis/assignment, remove/lower plagiarism or AI %, fake references or data, bypass Turnitin). Matches set `flagged=true` with `flag_reason`; the student sees a polite message explaining what we can do instead. A human on the team reviews flagged leads.
- [ ] SEO: metadata, sitemap, robots, structured data for the organisation, analytics with cookie consent.
- **Accept:** Lighthouse mobile ≥ 90 on Home; a test enquiry appears in `leads` and reaches the team inbox; a prohibited request is flagged; `copy-lint` passes.

### Phase 2: Free tools

All logic in `/lib/tools`, with unit tests. Each tool has an optional "email me my result" step (consent required) that creates a lead.

- [ ] **UGC Similarity Level Calculator.** Input: similarity % (and whether references and quotes were already excluded). Output: level, plain-language meaning, next steps, and the revision window. Thresholds and text come from `ugc_levels`. Seed values, which **the lawyer must verify against the UGC (Promotion of Academic Integrity and Prevention of Plagiarism) Regulations 2018 before launch**: Level 0 ≤10%; Level 1 >10–40% (revise and resubmit within a set period, max 6 months); Level 2 >40–60% (barred from submitting a revised thesis for one year); Level 3 >60% (PhD registration may be cancelled; UG/PG suspension). Show that references, quotes and similar exclusions are excluded when the official report is generated.
- [ ] **Resubmission Deadline Calculator.** Input: report date and level. Output: last date to resubmit (date + `action_window_months`), days left, and a plan by week.
- [ ] **Instant Quote Calculator.** Input: service, unit (words/pages/documents/project), quantity, turnaround. Output: low-high range from `service_prices`, rush multiplier from config, and "final quote after sample review". Never show a promised outcome.
- [ ] **Thesis Timeline Planner.** Input: submission date, degree level. Output: milestone dates working backwards (topic, synopsis, literature review, methodology, data, analysis, draft, similarity check, final). Download as `.ics`.
- [ ] **AI-Use Disclosure Generator.** Input: tools used, purpose, sections, dates. Output: a ready statement, with a note to check the institution's policy.
- **Accept:** each tool has unit tests covering the boundary values (10%, 40%, 60%); usable on a 360px screen; tool events are logged.

### Phase 3: Database and admin dashboard

- [ ] Admin layout with role-based navigation. `admin` sees everything; `verifier` sees Verification and Institutions; `ops` sees Leads and Orders.
- [ ] **Imports page:** the full flow from Section 4 (validate, stage, diff, conflicts, approve, rollback). Show batch history.
- [ ] **Exports page:** full export in the workbook layout; filtered CSV.
- [ ] **Institutions page:** searchable table, filters (state, kind, status), edit a row, every edit audited.
- [ ] **Verification queue:** authorities sorted by `active_covered` (highest first), owner assignment, open the official link, enter event type, exact date, evidence URL, and mark verified. Setting `verified` creates a `deadlines` row and updates the authority and the institutions it covers.
- [ ] **Prices page:** edit `service_prices`. **Leads page:** list, filter, mark handled, view flagged.
- [ ] **Audit log page.**
- **Accept (with the real workbook):** import produces exactly 8,000 institutions (1,427 University + 6,573 College), 1,427 authorities, and status counts for institutions of 3,886 `link_found`, 3,411 `proxy`, 702 `seasonality_only`, 1 `verified`; for authorities 724 `link_found`, 702 `manual_required`, 1 `verified`. Export then re-import shows **zero diff**. A rollback restores the earlier state.

### Phase 4: University Deadline Finder (public)

- [ ] `/universities`: search box with fast typeahead by name, state, district (Postgres trigram or full-text; response under 1 second).
- [ ] Institution page `/universities/[aishe_code]`: name, state, district, type, website; affiliating university; official calendar, exam and notice links; **status badge**:
  - `verified`: date, event type, "last verified" date, evidence link. If the date has passed, show "Date has passed" and hide the countdown.
  - `link_found`: "Official calendar found. We have not verified the dates yet. Please check the official page."
  - `proxy`: "Your college follows [affiliating university]'s calendar" with that university's links and badge.
  - `seasonality_only` / `manual_required`: "No dates available yet" plus a link to the institution website.
- [ ] "Notify me when verified" (contact + consent) writes to `deadline_alerts`. When a verifier marks a deadline verified, matching alerts are queued for email.
- [ ] Contextual service suggestion (for example, near a mid-semester date, "Draft review before evaluation").
- [ ] `noindex` on pages whose status is not `verified` (avoid thin pages).
- **Accept:** no unverified date appears anywhere on the public site; the IIT Delhi entry (mid-semester window begins 12 Sep 2026) renders as "Date has passed"; public API responses contain none of the admin-only columns.

### Phase 5: Accounts, orders, payments

- [ ] Student account (email OTP). Private Storage bucket for uploads; access via signed URLs only; per-user RLS.
- [ ] Uploads: PDF/DOCX, size limit, SHA-256 stored, `delete_after` set (default 90 days, configurable).
- [ ] Order flow: `submitted` → `screened` (human) → `quoted` → `paid_part` → `in_progress` → `delivered` → `closed`, plus `declined` and `refunded`. Every change written to `order_events`.
- [ ] **Razorpay** checkout with milestone payments (for example 30% at start, rest on delivery). Server-side order creation; **verify the webhook signature**; idempotent handling; store only Razorpay ids and amounts, never card data. Generate invoices.
- [ ] Ops order screen: status, assignee, due date, notes, delivery upload, refund action.
- [ ] Transactional emails at each status change (Resend). Reviews requested only after `delivered`; shown only when `published=true`.
- [ ] Data controls: student can download or delete their documents from the account page; delete removes the file and the row.
- **Accept:** end-to-end test in Razorpay test mode from enquiry to delivery; a failed payment does not advance the order; a duplicate webhook does not double-count; a student cannot access another student's file.

### Phase 6: Advanced features

Build each as its own small PR, in this order:

- [ ] **Similarity Report Decoder:** the student uploads a report PDF; a reviewer completes a structured breakdown (top matching sources, references vs real overlap, self-plagiarism, first fixes) which is shown in the account. Automate parsing only after the manual version works.
- [ ] **AI-Flag Appeal Kit:** evidence checklist, appeal letter builder (institution's integrity panel), optional lawyer review as a paid add-on.
- [ ] **Writing Proof Vault:** every uploaded draft is timestamped and hashed; version timeline; **Authorship Evidence Report** PDF. State clearly that it is supporting evidence and does not guarantee any outcome.
- [ ] **Mentor booking:** availability, session booking, structured feedback template that labels the type of each error; mentor workload view for ops.
- [ ] **Deadline reminders:** for verified deadlines and thesis milestones, email first, then WhatsApp once the Business API is approved. Consent-based, one-click unsubscribe. Scheduled via Vercel or Supabase cron.
- [ ] **Journal Finder:** needs a data source for Scopus and UGC-CARE status; ask before building (see Section 9).
- [ ] **Verified-institution SEO pages** and campus referral tracking.
- [ ] **Actual vs forecast dashboard (admin-only):** import `Actuals Input`, `Monthly Forecast` and month matrix data into an `admin` schema; charts of plan vs actual by month. Also monthly campaign checklist and geo-target export (CSV in the layout of the `Geo Targeting` sheet). None of it public.
- **Accept:** each feature has tests and its own short doc in `/docs`.

---

## 6. Visibility matrix

| Data                                                            | Public | Student  | Ops/Verifier  | Admin |
| --------------------------------------------------------------- | ------ | -------- | ------------- | ----- |
| Institution name, state, district, type, website, links, status | ✔      | ✔        | ✔             | ✔     |
| Verified dates and evidence                                     | ✔      | ✔        | ✔             | ✔     |
| Priority rank, base score, geo-target, radii                    | ✘      | ✘        | ✘             | ✔     |
| Forecast, spend, actuals, month matrix                          | ✘      | ✘        | ✘             | ✔     |
| Leads                                                           | ✘      | ✘        | ✔             | ✔     |
| Own orders and documents                                        | ✘      | own only | assigned only | ✔     |
| Audit log                                                       | ✘      | ✘        | ✘             | ✔     |

---

## 7. Quality and security checklist (every phase)

- [ ] Unit tests pass (`npm test`), end-to-end tests pass (`npm run e2e`), `copy-lint` passes, TypeScript has no errors.
- [ ] RLS tests: anonymous and student roles cannot read admin-only tables or columns.
- [ ] Forms protected by **Cloudflare Turnstile** and rate-limited.
- [ ] No secrets in the repo; service-role key used only on the server.
- [ ] Security headers set; file uploads validated by type and size; signed URLs expire.
- [ ] Automated daily database backup enabled; restore tested once before launch.
- [ ] Staging is used for every release; production deploys only from `main`.

---

## 8. Definition of done (whole project)

1. A student can find their institution, see honest deadline information, use the free tools, send an enquiry, pay, upload a draft, and receive delivery, all on the site.
2. The team can upload the workbook, review a diff, approve, roll back, verify deadlines, export in the original layout, and manage leads and orders.
3. No unverified date is shown as fact, and no prohibited service or phrase exists on the site.

---

## 9. Open decisions (Claude Code: ask me before building these)

1. **Site name and domain.** The workbooks use "StudyAssigned". Confirm.
2. **Pricing.** `Services & Pricing` lists standard originality editing at ₹0.28-0.45 per word, but the market report lists academic copyediting at ₹2.00-5.00 per word. Decide the real price list before launch; the site reads whatever is in `service_prices`.
3. **DrillBit and Turnitin checks.** The pricing sheet notes that ShodhShuddhi restricts UG/PG checking through DrillBit. Keep these services behind manual approval and lawyer sign-off; do not list them for direct purchase until decided.
4. **UGC thresholds and penalties text** (Phase 2): lawyer to verify against the regulation text.
5. **Age policy:** whether the Terms require users to be 18+.
6. **Legal pages:** Terms, Privacy (DPDP Act 2023), refund policy, and mentor contract wording, reviewed by the lawyer.
7. **Journal Finder data source** (Scopus and UGC-CARE lists).
8. **WhatsApp Business API** provider, and whether to start with `wa.me` links only.
9. **Retention period** for uploaded documents (default 90 days).
