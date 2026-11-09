# Expense Tracker

A simple expense tracker built to track your expenses, group them into categories, and see your spending at a glance.

> A small portfolio project — not intended for production use.

## Built With

This project was built using the [OpenCode](https://opencode.ai) harness with **DeepSeek V4 Pro** as the model. It was scaffolded on Techstream's [Quark](https://usequark.dev/) framework.

## Tech Stack

- **Next.js 16** — App Router + Server Actions
- **Prisma 7** + **PostgreSQL** — database layer
- **Tailwind CSS** — via the Quark UI kit
- **Redis** — sessions & rate limiting
- **Zod** — input validation
- **pnpm** + **Turborepo** — monorepo

## Features

- Create, read, update, and delete expenses
- Organise expenses into categories
- Spending summary dashboard

## Milestones

- [x] **Milestone 0 — Scaffold & run**
  Generate the Quark project and get it running locally. *Done when:* the app boots, the database is migrated, and `/api/health` is green.

- [x] **Milestone 1 — Prisma models (Category + Expense)**
  Define the two data shapes and their one-to-many relationship. *Done when:* `db:generate` + `db:migrate` succeed and the tables exist in Postgres.

- [x] **Milestone 2 — Query helpers (CRUD layer)**
  Reusable create/read/update/delete functions with filtering and pagination. *Done when:* all five helpers exist for both models and a test passes.

- [x] **Milestone 3 — Routes & actions**
  Wire the helpers to the web via Server Components and Zod-validated Server Actions. *Done when:* create/edit/delete work in the browser and bad input is rejected. Consider and test edge cases.

- [x] **Milestone 4 — UI**
  Build the pages and forms with the shared UI kit. *Done when:* every CRUD action is reachable with proper loading/empty/error states.

- [x] **Milestone 5 — Tests, lint & build**
  Prove the app works and compiles for production. *Done when:* `pnpm test`, `pnpm lint`, and `pnpm build` all pass.

## Getting Started

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Layout

```
apps/web        → Next.js app
packages/db     → Prisma schema + query helpers
packages/ui     → shared UI components
packages/config → environment config
```

## Scripts

| Command        | Purpose                  |
| -------------- | ------------------------ |
| `pnpm dev`     | Start the dev server     |
| `pnpm test`    | Run tests                |
| `pnpm lint`    | Lint & format (Biome)    |
| `pnpm build`   | Production build         |
