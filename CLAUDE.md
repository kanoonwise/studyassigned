@AGENTS.md

# StudyAssigned — Standing rules

Full spec: `BUILD_SPEC.md`. This file is Section 1 of that spec, kept here so it
loads every session.

## Product

A website for students and researchers in India that helps them **understand their similarity and AI reports, meet their institution's deadlines, and get editing and mentoring while they write their own work.** The team runs a backend admin dashboard to upload and download Excel data files and manage an institution database. Students select their institution and see its deadlines and related details.

## Non-negotiable content and product rules

- The student always writes their own work. **Never build or write copy for**: ghostwriting, writing a thesis or assignment for submission, tools that rewrite text to lower a similarity or AI-detection score, fake data or fake references, exam help, or unauthorised access to originality-checking tools.
- **Banned phrases** in any site copy, ad copy, page title or meta tag: "plagiarism removal", "AI removal", "remove AI", "bypass", "Turnitin bypass", "100% human", "humanize", "guaranteed", "guarantee" (in the sense of marks, approval, publication, or a similarity or AI score), "we write your thesis", "write my assignment". Use instead: "originality review", "citation improvement", "report explanation", "editing", "guidance", "author-led revision".
- Add a script `npm run copy-lint` that scans `/app`, `/components`, `/content` for banned phrases and **fails the build** if any are found (allow-list only the Integrity Policy page, where refusals are explained).
- No fear-based or shaming copy, no fake countdowns or fake scarcity.
- Every tool result and deadline page shows a short note: "Informational only. Your institution's own rules and official notices apply."
- **A deadline date is shown as fact only if its status is `verified`.** Everything else is shown as a link plus a "not verified by us yet" label.
- Prices are never hard-coded. They come from the `service_prices` table so the team can edit them.

## Engineering rules

- TypeScript strict mode. No `any` unless commented.
- All calculator logic lives in pure functions in `/lib/tools` with unit tests. Thresholds come from config tables, not constants in components.
- Row Level Security (RLS) on every table. Default deny. The public site reads only through public views.
- Never expose admin-only columns (scores, forecasts, spend, geo-targeting) to public queries.
- Every admin write goes to `audit_log` (who, what, before, after, when).
- Small commits, one feature per commit, conventional commit messages.
- Keep it lean: managed services only, no servers to maintain, no microservices, no extra queues.

## Build order

Build one phase from `BUILD_SPEC.md` Section 5 at a time. After each phase: run all
tests, list what was built, list every decision made that the spec did not cover, and
stop. Do not start the next phase until told to.
