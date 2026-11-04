# Expense Tracker — Build Plan

A step-by-step guide to building a full-stack expense tracker with **Quark**.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Prisma 7 + PostgreSQL (Docker) |
| Caching / sessions | Redis (Docker) |
| UI | Tailwind via `packages/ui` |
| Validation | Zod |
| Logging | `createLogger()` from `@usequark/quark-core` |
| Tests | `pnpm test` (Vitest) |

> **There is no separate backend server.** In this stack, the "backend" is the set of
> **Prisma models → query helpers → route handlers / Server Actions** inside the Next.js app.

## The data flow (memorize this)

```
Browser form ──▶ Server Action / route handler ──▶ query helper ──▶ Prisma ──▶ PostgreSQL
        ◀────────────────── returned data ◀────────────────────────────┘
```

Each layer does one job:

1. **Models** (`schema.prisma`) — define *what* the data looks like.
2. **Query helpers** (`packages/db/src/queries.js`) — the create/read/update/delete functions.
3. **Server Actions / route handlers** (`apps/web`) — validate input and call the helpers.
4. **UI** (`apps/web`) — what the user sees and interacts with.

---

## Progress tracker

- [ ] Milestone 0 — Scaffold & run
- [ ] Milestone 1 — Prisma models
- [ ] Milestone 2 — Query helpers (CRUD layer)
- [ ] Milestone 3 — Routes & actions (mutation boundary)
- [ ] Milestone 4 — UI
- [ ] Milestone 5 — Tests, lint, build

---

## Decision log

| Decision | Choice |
|---|---|
| Auth | None — single-user, global data (no `userId` on models) |
| Jobs package | Omitted (add later if email/reporting needed) |
| Deployment | Skipped (local dev only) |

> **Note:** Quark ships a login screen by default. We are *not* removing it — we're simply
> not scoping data per-user. All expenses/categories are global. You can ignore the login step.

---

## Milestone 0 — Scaffold & run

**What:** Generate the project skeleton and get it running locally.

**Why:** Before writing any product code, the foundation (database connection, dev server,
UI primitives) must exist. Quark generates it all so you don't wire it by hand.

**Steps:**

1. Check prerequisites are installed:
   ```bash
   node --version    # Node 24
   pnpm --version
   docker --version
   ```
2. Scaffold the project:
   ```bash
   npx @usequark/quark-create-app@latest expense-tracker --packages ui --harness opencode
   ```
3. Move into the project and start the services:
   ```bash
   cd expense-tracker
   docker compose up -d
   ```
4. Create the database tables and start the dev server:
   ```bash
   pnpm db:migrate
   pnpm dev
   ```
5. Open `http://localhost:3000` and confirm the app loads.
6. Read `MAIN.md` and the skill index in `.opencode/skills/` — these teach the "Quark way"
   of building features.

**Done when:**

- [ ] `http://localhost:3000` loads
- [ ] Login screen appears (expected — we ignore it)
- [ ] Database is reachable (migrations ran without error)

**Concepts learned:** Monorepo layout (`apps/web`, `packages/db`, `packages/ui`), the dev loop.

---

## Milestone 1 — Prisma models

**What:** Define the shape of an expense and a category in one schema file.

**Why:** Prisma is an ORM. You describe your tables, and it generates the code to query them.
You never write raw SQL — you define *what* data exists and *how* it relates.

**Steps:**

1. Open `packages/db/prisma/schema.prisma`.
2. Add the `Category` model:
   ```prisma
   model Category {
     id        String    @id @default(cuid())
     name      String    @unique
     createdAt DateTime  @default(now())
     updatedAt DateTime  @updatedAt
     expenses  Expense[]
   }
   ```
3. Add the `Expense` model:
   ```prisma
   model Expense {
     id          String   @id @default(cuid())
     description String
     amount      Decimal  @db.Decimal(10, 2)
     date        DateTime
     note        String?
     categoryId  String
     category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@index([categoryId])
     @@index([date])
   }
   ```
4. Generate the query code and apply the change to the database:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

**Done when:**

- [ ] Both models are in `schema.prisma`
- [ ] `pnpm db:generate` and `pnpm db:migrate` succeed
- [ ] The `Expense` → `Category` relationship exists (foreign key)

**Concepts learned:** Data modeling, relationships (one category → many expenses), foreign keys,
`Decimal` for exact money math (never `Float` for currency).

---

## Milestone 2 — Query helpers (the CRUD layer)

**What:** Write reusable read/write functions, kept separate from the UI.

**Why:** Pages should never touch the database directly. A clean set of functions
(`findAll`, `findById`, `create`, `update`, `delete`) can be reused anywhere.
This is the classic "repository" pattern.

**Steps:**

1. Open `packages/db/src/queries.js`.
2. For **expenses**, write five helpers:
   - `findAllExpenses` — list all expenses, with pagination and filters
     (by `categoryId`, date range, search text)
   - `findExpenseById` — fetch one expense (return null if missing)
   - `createExpense` — insert a new expense
   - `updateExpense` — change an existing expense
   - `deleteExpense` — remove an expense
3. Repeat for **categories** (lighter — categories are simpler):
   - `findAllCategories`, `findCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`
4. Keep each helper small and reusable — accept pagination options where a list view needs them.
5. Add a focused test that proves `createExpense` + `findExpenseById` work.

**Done when:**

- [ ] All five CRUD helpers exist for expenses
- [ ] Category helpers exist
- [ ] At least one query-helper test passes (`pnpm test`)

**Concepts learned:** Separation of concerns, the CRUD acronym, pagination and filtering.

---

## Milestone 3 — Routes & actions (mutation boundary)

**What:** Connect the browser to the helpers — the surface users actually interact with.

**Why:** Helpers are meaningless until something calls them. This milestone builds the
**request → validate → act → respond** flow. Validation matters: never trust input from a browser.

**Steps:**

1. **Reads** — build Next.js **Server Components** (pages that query the DB and render):
   - `/expenses` — list of expenses
   - `/categories` — list of categories
2. **Writes** — build **Server Actions** (functions triggered on form submit) for:
   - create expense
   - update expense
   - delete expense
   - create / update / delete category
3. Wrap every action in **Zod** validation (e.g. "amount must be positive", "description required").
4. Handle failures with `AppError` / `ValidationError`, and log with `createLogger()`
   (never `console.log`).
5. Add a `/dashboard` page with a **summary** — total spending this month and a breakdown
   by category (your first aggregation/grouping query).

**Done when:**

- [ ] `/expenses` and `/categories` render data
- [ ] Create, edit, and delete work in the browser
- [ ] Invalid input is rejected with a clear message

**Concepts learned:** Validation, error handling, and the full CRUD round trip
(Create / Read / Update / Delete) end-to-end.

---

## Milestone 4 — UI

**What:** Make the pages usable and pleasant.

**Why:** Until now the UI is barebones. This milestone turns raw data into a real interface
using Quark's pre-built component library.

**Steps:**

1. Build `ExpenseList` — a table/card list of expenses.
2. Build `ExpenseForm` — one form used for both **create** and **edit** (reuse it).
3. Build `CategoryFilter` — dropdown to filter the list.
4. Build `SummaryCards` — "Total this month", "Top category", etc. on the dashboard.
5. Add pagination controls for the list.
6. Format money with `Intl.NumberFormat` (e.g. `$1,234.56`), and add empty / loading / error states.

**Done when:**

- [ ] Every CRUD action is reachable from the UI
- [ ] Money is formatted correctly
- [ ] Empty, loading, and error states are handled

**Concepts learned:** Component design — small reusable pieces instead of one giant page.

---

## Milestone 5 — Tests, lint, build

**What:** Prove everything works and that it compiles for production.

**Why:** Untested code breaks silently. Linting keeps the code consistent. A build confirms
it can actually ship. This is the "professional finishing" milestone.

**Steps:**

1. Write tests next to the code they cover (query helpers, action validation logic).
2. Run until all green:
   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

**Done when:**

- [ ] `pnpm test` passes
- [ ] `pnpm lint` is clean
- [ ] `pnpm build` succeeds

**Concepts learned:** Automated testing, linting, production builds.

---

## Quick reference — commands

```bash
# Scaffold
npx @usequark/quark-create-app@latest expense-tracker --packages ui --harness opencode

# Run (from the project folder)
docker compose up -d     # start Postgres + Redis
pnpm db:migrate          # apply schema changes
pnpm dev                 # start the dev server

# After editing the schema
pnpm db:generate         # regenerate the Prisma client
pnpm db:migrate          # apply the migration

# Verify
pnpm test                # run tests
pnpm lint                # lint
pnpm build               # production build
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| App won't start / "connection refused" | Make sure `docker compose up -d` ran and Postgres/Redis are up (`docker compose ps`) |
| Schema change not visible | Run `pnpm db:generate` then `pnpm db:migrate` |
| Migration failed | Check `schema.prisma` for syntax errors; don't use `db:push` for real changes |
| Login screen blocks you | Expected — we ignore auth; data is global. Just sign in with any local account or skip. |

---

## Learning order recap

```
0. Get it running        → understand the scaffold
1. Define data           → understand models & relationships
2. Query helpers         → understand CRUD in isolation
3. Routes/actions        → understand the request/response flow
4. UI                    → understand the front end
5. Test & build          → understand quality
```
