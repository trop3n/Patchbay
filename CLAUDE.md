# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Patchbay is a self-hosted A/V technical documentation and diagramming platform for signal flow, network topology, device monitoring, and asset management. Target: small A/V teams (5-20 people).

## Commands

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit

npm test                                    # All tests (in __tests__/)
npm test -- path/to/test.test.ts            # Single test file
npm test -- --testNamePattern="test name"   # Tests matching name
npm run test:watch                          # Watch mode

npx prisma generate      # Generate Prisma client after schema changes
npx prisma migrate dev   # Create/run migrations
npx prisma db seed       # Seed database

npm run docker:dev:build # Docker dev environment
npm run syslog:dev       # Syslog server on port 1514
npm run snmp             # SNMP poller
npx prisma studio        # Database GUI
```

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript + PostgreSQL/Prisma + NextAuth.js v5 + Tailwind/shadcn/ui

### Key Layers

- **Pages** (`app/(dashboard)/`): Server components with `export const dynamic = 'force-dynamic'`. `searchParams` and `params` are `Promise` types that must be awaited.
- **Server Actions** (`app/actions/`): All mutations. Pattern: check `auth()` → validate with Zod → Prisma operation → `createAuditLog()` → `revalidatePath()`. Return `{ success: true, data }` or `{ error: string, issues?: ZodIssue[] }`.
- **Components** (`components/`): UI in `components/ui/` (shadcn/ui). Feature components grouped by domain.
- **Lib** (`lib/`): Auth config, Prisma singleton, Zod schemas (`lib/validations/`), audit logging (`lib/audit.ts`), authorization helpers (`lib/authorize.ts`), SNMP/syslog integrations.
- **Database** (`prisma/schema.prisma`): 14 models. Key enums: `Role`, `SystemStatus`, `DiagramType`, `DeviceStatus`, `AlertSeverity`.

### Diagrams

Dual diagram system: **React Flow** (`@xyflow/react`) for structured signal flow diagrams with 31 custom A/V node types, and **Excalidraw** for freeform whiteboard diagrams. Diagram data stored as JSON with version history.

### Real-Time Monitoring

SSE endpoint (`/api/events/devices`) pushes device status every 5 seconds. Client uses `useDeviceStatus()` provider. SNMP polling and syslog parsing run as separate scripts.

### Auth & Authorization

NextAuth.js v5 with JWT strategy. Middleware protects all routes except `/login`, `/error`, `/api/auth`, static assets. Role-based access: `canWrite(role)` for ADMIN/EDITOR, `isAdmin(role)` for ADMIN-only operations.

## Code Style

- `'use client'` or `'use server'` first, then React/Next → third-party → `@/` imports → `import type`
- 2-space indent, single quotes, semicolons
- Function declarations, NOT arrow functions for components
- `export function ComponentName()` (named exports); `export default` only for page components
- `interface` for props, `type` for unions/Prisma-derived types
- No code comments unless explicitly requested
- Conventional commits: `feat(diagrams): add signal flow`, `fix(auth): handle timeout`

## Environment

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

Optional: `SYSLOG_*`, `SNMP_*`, `ALERT_*`, `SMTP_*` (see `.env.example`)
