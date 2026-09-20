# StudyAssigned

India academic support platform. See `BUILD_SPEC.md` for the full product and
engineering spec, and `CLAUDE.md` for the standing rules every phase follows.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Turnstile etc. - see below
npm run dev
```

Useful scripts:

| Script                                  | What it does                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                           | Start the dev server                                                                                         |
| `npm run build`                         | Production build                                                                                             |
| `npm run lint` / `npm run format:check` | ESLint / Prettier                                                                                            |
| `npm run typecheck`                     | `tsc --noEmit`                                                                                               |
| `npm test`                              | Vitest unit tests                                                                                            |
| `npm run e2e`                           | Playwright end-to-end tests (builds and serves the app first, or point at a running one with `E2E_BASE_URL`) |
| `npm run copy-lint`                     | Fails if a banned phrase (see CLAUDE.md) is found in `/app`, `/components` or `/content`                     |
| `npm run seed:admin`                    | Promotes one user to the `admin` role (`ADMIN_EMAIL=you@example.com npm run seed:admin`)                     |

## One-time infrastructure setup (manual - needs your own accounts)

This repo has no access to create cloud accounts on your behalf. Set these up
once, then everything else (migrations, deploys) is driven from the repo.

### 1. Supabase - two projects, `staging` and `production`

For each project:

1. Create the project at [supabase.com](https://supabase.com).
2. Link the CLI and push the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push   # runs everything in supabase/migrations
   ```
3. Copy the project's URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the service role key into
   `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_*`).
4. Enable email OTP under Authentication → Providers (it's on by default);
   turn off any sign-up methods you don't want (magic link is enabled
   alongside OTP by default, which is fine for admin sign-in).
5. Seed the first admin:
   ```bash
   ADMIN_EMAIL=you@example.com npm run seed:admin
   ```
   This creates (or reuses) the auth user and sets `profiles.role = 'admin'`
   directly via the service role key, bypassing RLS - it's the one
   intentional bootstrap step, since RLS otherwise blocks anyone from
   granting themselves the admin role.

### 2. Vercel

1. Import the repo as a Vercel project.
2. Production deploys from `main`; add a second environment (or a second
   Vercel project) that deploys from `develop` for staging.
3. Set every variable from `.env.example` in both environments, pointing at
   the matching Supabase project (staging env vars → staging Supabase
   project, production → production).

### 3. Cloudflare Turnstile

Create a Turnstile widget at the Cloudflare dashboard, one per environment
(or one covering both domains). Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
`TURNSTILE_SECRET_KEY`.

### 4. Resend, Razorpay, WhatsApp

Not required for Phase 0. `RESEND_API_KEY` is used starting Phase 1 (enquiry
emails); `RAZORPAY_*` starting Phase 5; `WHATSAPP_NUMBER` is just a phone
number for `wa.me` links, starting Phase 1.

## Database migrations

Everything lives in `supabase/migrations/`, applied in filename order by
`supabase db push`. They set up the full Section 3 schema, enable Row Level
Security on every table (default deny), and add `public_*` views that are
the only thing an anonymous visitor can read.
