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

## Known Issues & Technical Debt

### Security (Critical/High)

- **Stored XSS in document viewer** (`components/documents/document-viewer.tsx:30`): `RICH_TEXT` content rendered via unsanitized HTML injection. Any EDITOR can inject script tags stored in DB and executed for all viewers. Fix: sanitize with `dompurify`/`sanitize-html` before rendering and before saving.
- **Deactivated users bypass access control** (`middleware.ts` + `lib/auth.ts`): When a user is deactivated, their JWT `id` is set to `''` but the session object is still truthy. Middleware only checks `if (!session)`, so deactivated users pass through to all routes and server actions. Fix: check `!session.user.id` in middleware.
- **No rate limiting on login**: Credentials provider has no brute-force protection. Consider adding rate limiting middleware or account lockout.
- **SNMP community strings exported in CSV** (`app/actions/csv.ts`): `exportDevices()` includes `snmpCommunity` field in cleartext CSV exports. This is effectively a password for SNMP v1/v2c.
- **Retention API routes lack role checks** (`app/api/retention/route.ts`, `app/api/retention/cleanup/route.ts`): Routes delegate to server actions but any authenticated user (including VIEWER) can call them since the route handlers don't check roles before invoking the actions.
- **Open redirect in login form** (`app/(auth)/login/login-form.tsx`): `callbackUrl` taken from query string and passed to `router.push()` without validation. Attacker can craft `?callbackUrl=https://evil.com` for phishing. Fix: validate it starts with `/` and not `//`.
- **Webhook SSRF bypass** (`lib/alerts/notifications.ts`): Webhook URL validation checks hostnames at config time but not post-DNS-resolution. DNS rebinding can bypass private IP blocklist. Fix: resolve hostname to IP before making the request and check resolved IP.
- **Content-Disposition header injection** (`app/api/attachments/[id]/route.ts`): `originalName` from DB used unsanitized in `Content-Disposition` header. Fix: sanitize or encode the filename.

### Bugs (High/Medium)

- **CSV export crashes when device has no system** (`app/actions/csv.ts:297`): `d.system.slug` throws `TypeError` if system is null. Fix: add null check (`d.system?.slug ?? ''`).
- **~~Cannot disassociate device from system~~** (`app/actions/devices.ts:183`): `systemId` is required on Device, so disassociation is by design. System reassignment via truthy `systemId` works correctly.
- **SSE stream leak on early disconnect** (`app/api/events/devices/route.ts`): Abort listener registered after initial async `fetchDevices()` call — if client disconnects during that await, the interval is never cleaned up. Also, uncaught throw from `fetchDevices()` leaves the controller unclosed.
- **File deleted before DB record in attachment deletion** (`app/actions/attachments.ts:112-113`): If `prisma.attachment.delete()` fails after `deleteFile()`, the file is gone but the DB record remains, causing 404s on future access. Fix: delete DB record first, then file.
- **Non-atomic diagram version pruning** (`app/actions/diagrams.ts:117-126, 213-221`): Uses 3 sequential queries (count, findMany, deleteMany) without a transaction. Race condition under concurrent saves. Fix: wrap in `prisma.$transaction` or use a single subquery-based delete.
- **`deleteSystem` fails silently with FK constraints** (`app/actions/systems.ts`): Deleting a system with attached devices fails due to required FK, but returns a generic "Failed to delete" error. Fix: cascade or check for dependents and return a descriptive error.
- **Stale log data when search params cleared** (`components/logs/device-log-list.tsx:81-85`): `fetchLogs` not re-invoked when search params are cleared, leaving stale results visible.

### Performance (Remaining)

- **SSE polls all devices per connected client** (`app/api/events/devices/route.ts`): Each SSE client creates its own independent `setInterval` polling the DB every 5s. No shared broadcaster. Fix: use a module-level singleton that polls once and fans out to all clients.
- **`getFilteredDevices`/`getFilteredAssets` are unbounded** (`app/actions/devices.ts:66`, `app/actions/assets.ts:63`): No `take` limit on filtered list queries. Fix: add pagination parameters and UI controls.
- **Note**: Run `npx prisma migrate dev` to apply the new database indexes added to `prisma/schema.prisma`.

## Roadmap

See `PLAN.md` for full architecture and development roadmap. Phase 1 (MVP) and Phase 2 (Enhanced Docs) are complete. Phase 3 (SIEM-Lite: device monitoring, syslog, SNMP, alerts, retention) is in progress.
