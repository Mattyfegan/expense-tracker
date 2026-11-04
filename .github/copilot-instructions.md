<skills>
<skill>
<name>project-context</name>
<description>Project-specific context and conventions. This skill evolves with your project - update it as your architecture grows.</description>
<file>.github/skills/project-context/SKILL.md</file>
</skill>
</skills>

# expense-tracker - Project Conventions

> Scaffolded with Quark on 2026-11-04. Package scope: `@expense-tracker`
> Also see `CLAUDE.md` at the project root for the full context reference.

## Non-Negotiable Rules

- **ESM only** - `import`/`export` everywhere. Never `require()`.
- **No authored TypeScript** - `.js` and `.jsx` only. Generated code may emit typed artifacts, but project code should not add `.ts` or `.tsx` sources.
- **Validate at every boundary** - Zod schemas on all Server Actions and API routes.
- **Errors** - `AppError` / `ValidationError` from `@usequark/quark-core/errors` in app/runtime code. Native `Error` is acceptable in library, bootstrap, CLI, and test code.
- **Logging** - `createLogger(name)` from `@usequark/quark-core` in app/runtime code. Console output is acceptable in bootstrap, CLI, and test code.
- **DB models** - Always add `createdAt` and `updatedAt` to every Prisma model.
- **Workspace imports** - Use `@expense-tracker/*` for local packages (`db`, `config`, `ui`, `jobs`). Never `@usequark/quark-db` etc.
- **Tests** - Co-located `*.test.js`, run with `node --test`.

## Import Patterns

```javascript
// Workspace packages:
import { prisma, user }          from "@expense-tracker/db";
import { loadConfig }            from "@expense-tracker/config";
import { Button, Card, Input }   from "@expense-tracker/ui";
import { JOB_TYPES }             from "@expense-tracker/jobs";

// Published runtime:
import { AppError, ValidationError } from "@usequark/quark-core/errors";
import { createLogger, getCurrentSession, createQueue, addJob } from "@usequark/quark-core";
```

## UI & Design System

Components from `@expense-tracker/ui` - Tailwind-only, Server Component safe:
`Button`, `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Badge`,
`Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter`,
`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`,
`Skeleton`, `ErrorBanner`, `Footer`, `Navbar`/`MobileNavbar`, `RichText`,
`QuarkLogo` *(server)*, `Dialog` *(client)*, `Toast`/`useToast` *(client)*,
`ThemeProvider`/`useTheme` *(client)* - dark/light mode context.

All accept `className`. Never import from `@/components/ui/*`.
Inspect `apps/web/src/app/page.js` and `packages/ui/README.md` before creating bespoke public-page layout primitives.

## Standard Patterns

```javascript
// Server Action:
"use server";
const parsed = schema.safeParse(Object.fromEntries(formData));
if (!parsed.success) throw new ValidationError(parsed.error.flatten());
const session = await getCurrentSession();
if (!session) throw new AppError("Unauthorized", 401);

// New env var: register in packages/config/src/validate-env.js first.
// New DB model: schema.prisma → pnpm db:generate → pnpm db:migrate.
// New job: define type in packages/jobs/src/index.js, handler in apps/worker/src/handlers/.
```
