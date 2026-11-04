# Expense Tracker

A simple expense tracker built to learn full-stack CRUD. Track your expenses, group them into categories, and see your spending at a glance.

> A small portfolio project — not intended for production use.

## Built With

This project was built using [OpenCode](https://opencode.ai), an AI coding harness, with **DeepSeek V4 Pro** as the model. It was scaffolded on [Quark](https://usequark.dev/).

## Tech Stack

- **Next.js 16** — App Router + Server Actions
- **Prisma 7** + **PostgreSQL** — database layer
- **Tailwind CSS** — via the Quark UI kit
- **Redis** — sessions & rate limiting
- **Zod** — input validation
- **pnpm** + **Turborepo** — monorepo

## Features

- Create, read, update, and delete expenses
- Organize expenses into categories
- Spending summary dashboard

## Milestones

- [x] Milestone 0 — Scaffold & run
- [x] Milestone 1 — Prisma models (Category + Expense)
- [ ] Milestone 2 — Query helpers (CRUD layer)
- [ ] Milestone 3 — Routes & actions
- [ ] Milestone 4 — UI
- [ ] Milestone 5 — Tests, lint & build

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
