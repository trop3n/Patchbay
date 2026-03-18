# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Patchbay is a self-hosted A/V technical documentation and diagramming platform for signal flow, network topology, device monitoring, and asset management. Target: small A/V teams (5-20 people).

## Quick Start

```bash
npm install && cp .env.example .env
npx prisma generate && npx prisma migrate dev && npx prisma db seed
npm run dev  # http://localhost:3000
```

Default login: `admin@patchbay.local` / `admin123`

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
npx prisma studio        # Database GUI

npm run docker:dev:build # Docker dev environment (rebuild)
npm run docker:dev       # Docker dev environment (existing)
npm run docker:dev:down  # Stop dev containers
npm run docker:prod:build # Docker prod environment
npm run syslog:dev       # Syslog server on port 1514
npm run snmp             # SNMP poller
npm run retention:cleanup # Run log/alert retention cleanup
```

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript + PostgreSQL/Prisma + NextAuth.js v5 + Tailwind/shadcn/ui

### Key Layers

- **Pages** (`app/(dashboard)/`): Server components with `export const dynamic = 'force-dynamic'`. `searchParams` and `params` are `Promise` types that must be awaited. Resources: systems, diagrams, documents, assets, devices, racks, led-walls, search, settings. Auth pages under `app/(auth)/`.
- **Server Actions** (`app/actions/`): All mutations (17 action files). Pattern: check `auth()` → validate with Zod → Prisma operation → `createAuditLog()` → `revalidatePath()`. Return `{ success: true, data }` or `{ error: string, issues?: ZodIssue[] }`.
- **Components** (`components/`): UI in `components/ui/` (shadcn/ui). Feature components grouped by domain.
- **Lib** (`lib/`): Auth config, Prisma singleton, Zod schemas (`lib/validations/`), audit logging (`lib/audit.ts`), authorization helpers (`lib/authorize.ts`), SNMP/syslog integrations.
- **Database** (`prisma/schema.prisma`): 15 models. Key enums: `Role` (ADMIN/EDITOR/VIEWER), `SystemStatus`, `DiagramType` (SIGNAL_FLOW/WHITEBOARD/NETWORK/RACK_LAYOUT), `DeviceStatus`, `AlertSeverity`, `ContentType`, `AssetStatus`, `LogLevel`, `LedWallType`.

### Diagrams

Dual diagram system: **React Flow** (`@xyflow/react`) for structured signal flow diagrams with 31 custom A/V node types, and **Excalidraw** for freeform whiteboard diagrams. Diagram data stored as JSON with version history (max 50 versions per diagram).

- Node types defined in `components/diagrams/node-types.ts` across 6 categories: Video, Video Processing, Audio, Control, Network, Generic
- Custom node renderer: `components/diagrams/av-node.tsx`
- 5 pre-built templates in `lib/diagram-templates.ts` (Conference Room, Classroom, Auditorium, Basic Network, Rack Layout)

### Real-Time Monitoring

SSE endpoint (`/api/events/devices`) pushes device status every 5 seconds. Client uses `useDeviceStatus()` provider. SNMP polling and syslog parsing run as separate scripts.

### Auth & Authorization

NextAuth.js v5 with JWT strategy and Credentials provider (local username/password, bcryptjs). JWT re-validates role/active status from DB every 5 minutes. Middleware protects all routes except `/login`, `/error`, `/api/auth`, `/api/events`, static assets. Role-based access: `canWrite(role)` for ADMIN/EDITOR, `isAdmin(role)` for ADMIN-only operations.

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

## Roadmap

See `PLAN.md` for full architecture and development roadmap. Phase 1 (MVP) and Phase 2 (Enhanced Docs) are complete. Phase 3 (SIEM-Lite: device monitoring, syslog, SNMP, alerts, retention) is in progress.
