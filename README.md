# PM Tool

Practice management app for an accounting firm, built around the automated
lead-to-client workflow in [`docs/PRD.md`](docs/PRD.md):

```
Website form → Google Workspace email → Google Calendar booking → Google Meet
   → Gamma proposal → QuickBooks invoice → Client created in PM-Tool
   → Work items created in PM-Tool
```

**Built so far:** the Deals pipeline (a Kanban board of the sales pipeline,
modeled after the reference screenshot), the underlying data model, and the
integration points needed to plug in the external tools (a lead-intake
webhook, and automatic Client creation when a deal reaches Onboarding).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + PostgreSQL

## Getting started (local)

Requires a Postgres instance — a local install, Docker, or a free one from
your hosting provider.

```bash
npm install
cp .env.example .env   # then set DATABASE_URL to your Postgres connection string
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/deals`, the pipeline board.

## Deploying (e.g. Railway)

1. **Add a Postgres database** to the project (Railway: "+ New" → Database →
   PostgreSQL).
2. **Point the web service at it**: in the web service's Variables tab, add
   `DATABASE_URL` and set it to a reference to the Postgres service's own
   `DATABASE_URL` (Railway: "+ New Variable" → "Add Reference" → pick the
   Postgres service). Don't hardcode a connection string — the reference
   keeps it in sync if the DB ever moves.
3. **Deploy.** `npm install` runs `prisma generate` automatically
   (`postinstall` script), and `npm start` runs `prisma migrate deploy`
   before `next start` — so every deploy applies any new migrations to the
   real database first. Nothing else to configure; Next.js reads the
   platform's `PORT` automatically.
4. **Seed it once**, if you want the demo pipeline data: run
   `npm run db:seed` from a one-off Railway shell/job against the deployed
   `DATABASE_URL` (or leave it empty and create deals from the UI/webhook).

If a deploy shows a generic "server error" page, it's almost always one of:
`DATABASE_URL` not set on the web service, or migrations never ran (check
the deploy logs for the `prisma migrate deploy` step).

## What's working

- **`/deals`** — Kanban pipeline (New Enquiry → Discovery Booked → Discovery
  Completed → Proposal Required → Proposal Sent → Onboarding). Drag cards
  between stages, search, and add a deal. Moving a deal into **Onboarding**
  automatically creates a **Client** record.
- **`/clients`** — clients created from won deals.
- **`POST /api/leads/intake`** — webhook for the website enquiry form (or
  Zapier/Make in front of it) to create a new pipeline deal. See
  `src/app/api/leads/intake/route.ts` for the payload shape.
- **`GET/POST /api/deals`**, **`PATCH/DELETE /api/deals/[id]`** — deal CRUD
  and stage updates, used by the board.

Every other sidebar item is a scaffolded placeholder (`ComingSoon`) so the
navigation matches the target IA without pretending those screens exist yet.

## Data model

See `prisma/schema.prisma`. Stage/priority/source are plain strings
constrained in `src/lib/constants.ts` rather than native Postgres enums, so
adding a new value never needs a migration.

## Next up

Per the PRD's phased rollout: QuickBooks webhook → automatic Client
conversion, Google Calendar event linkage on the Lead, Gamma proposal link
capture, engagement templates driving real Work Items, and a client portal.
