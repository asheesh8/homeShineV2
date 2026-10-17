# HomeSHINE — Website & Field App

The public website and internal field app for **HomeSHINE**, a Vermont exterior-care company (house washing, roof and gutter cleaning, deck sealing, concrete and paver cleaning).

- **Public site** — services, plans, proof/before-and-after, FAQ, and a `/book` portal where customers request an assessment slot.
- **Field app** (`/admin`) — a phone-first tool staff use on site: create an assessment, score each surface, get an AI write-up, pick a plan, book the job, and send documents.

**Live:** https://homeshinevt.com (Vercel project: `home-shine-v2.vercel.app`)

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 plus `app/site.css` for the marketing pages |
| Database | Supabase (Postgres), accessed server-side with the service-role key |
| AI | Anthropic Claude for assessment summaries (`app/api/ai-summary`) |
| Hosting | Vercel |

## Project layout

```
app/                    Public pages (/, /about, /services, /plans, /book, /proof, /faq, /contact)
app/admin/              Field app and staff tools (promos, certificate, market, reasoning)
app/app/                Old /app URLs — redirect to /admin
app/agenda/             Working-session page for the software proposal
app/api/                Route handlers: assessments, booking requests, available slots,
                        expenses, tax rates, AI summary, seeding
components/field-app/   Field app: screens, panels, stepper flow, hooks, API client
components/site/        Marketing-site building blocks and interactive widgets
components/booking/     The public booking portal
lib/                    Domain model (simple-field.ts), Supabase client, row mapping,
                        tax rates, document generators
supabase/               SQL for the tax-rate, booking-request and expense tables
docs/                   Architecture notes for the field app (component tree, state machine)
```

See [`docs/architecture.md`](docs/architecture.md) and [`docs/ui-architecture.md`](docs/ui-architecture.md) for how the field app is put together.

## Local setup

Requires Node 20+ and a Supabase project.

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev                  # http://localhost:3000
npm run lint
```

Create the tables by running the SQL files in `supabase/` in order in the Supabase SQL editor. The `assessments` table the field app reads and writes is not in that folder yet; its columns are listed in `AssessmentRow` in `lib/assessment-store.ts`.

## Environment variables

Names only — put values in `.env.local` (git-ignored) or in Vercel's project settings. Never commit them.

| Variable | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | Public key; listed in `.env.example` but not read by the code today |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses row-level security — never import `lib/supabase-admin.ts` into client code |
| `ANTHROPIC_API_KEY` | Server only | AI assessment summaries |
| `FIELD_APP_USERS` | Server only | Staff sign-in for the field app (added by the sign-in hardening PR) |
| `FIELD_SESSION_SECRET` | Server only | Signs the field-app session cookie (same PR) |

## Deploying

Vercel builds with `npm run build`. Pushes to `main` deploy to production; other branches get preview URLs. Set the environment variables above in the Vercel project before the first deploy — API routes throw a clear error if a Supabase variable is missing.

Database changes are not applied automatically: add a numbered SQL file under `supabase/` and run it in Supabase before deploying code that depends on it.
