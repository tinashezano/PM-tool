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
- [Prisma](https://www.prisma.io) + SQLite for local dev (swap the
  datasource for Postgres/MySQL when deploying)

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/deals`, the pipeline board.

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

See `prisma/schema.prisma`. Enums (`DealStage`, `DealPriority`, `DealSource`)
are plain strings constrained in `src/lib/constants.ts` — SQLite has no
native enum support in Prisma.

## Next up

Per the PRD's phased rollout: QuickBooks webhook → automatic Client
conversion, Google Calendar event linkage on the Lead, Gamma proposal link
capture, engagement templates driving real Work Items, and a client portal.
