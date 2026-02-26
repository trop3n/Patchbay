# AGENTS.md

Guidelines for AI coding agents working on Patchbay - an A/V technical documentation and diagramming platform.

## Build/Lint/Test Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Development server (http://localhost:3000)
npm run build                # Build for production
npm run lint                 # Lint code (ESLint via next lint)
npm run typecheck            # Type check (tsc --noEmit)

# Testing
npm test                                    # Run all tests
npm test -- path/to/test.test.ts            # Run single test file
npm test -- --testNamePattern="test name"   # Run tests matching name

# Database
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations (development)
npx prisma migrate deploy    # Run migrations (production)
npx prisma db seed           # Seed database
npx prisma studio            # Open database GUI

# Docker
npm run docker:dev           # Start dev containers
npm run docker:dev:build     # Rebuild and start dev containers
npm run docker:dev:down      # Stop dev containers

# Syslog Server (optional)
npm run syslog               # Requires sudo for port 514
npm run syslog:dev           # Port 1514 (no sudo)

# SNMP Poller (optional)
npm run snmp                 # Start SNMP poller (continuous polling)
```

## Tech Stack

Next.js 14 (App Router), TypeScript 5.x, PostgreSQL + Prisma ORM, NextAuth.js v5, Tailwind CSS + shadcn/ui, React Flow (@xyflow/react), Excalidraw, Zod, Jest, React Hook Form

### Project Structure

```
app/
  (auth)/               # Auth routes (login, error)
  (dashboard)/          # Protected routes
  actions/              # Server actions
components/
  ui/                   # shadcn/ui components
  diagrams/             # React Flow and Excalidraw
lib/
  auth.ts               # NextAuth configuration
  prisma.ts             # Prisma client singleton
  validations/          # Zod schemas
  audit.ts              # Audit logging
prisma/schema.prisma    # Database schema
types/index.ts          # Shared types
```

### Prisma Models

User, System, Diagram, Document, Asset, Device, DeviceLog, Rack, AuditLog, Attachment

Enums: `Role` (ADMIN/EDITOR/VIEWER), `SystemStatus`, `DiagramType`, `AssetStatus`, `DeviceStatus`, `ContentType`, `LogLevel`

## Code Style

### Imports

Place `'use client'` or `'use server'` first. Import order: React/Next.js → Third-party → `@/` imports → Type imports (with `import type`).

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createSystem } from '@/app/actions/systems'
import type { SystemStatus } from '@prisma/client'
```

### Formatting & Naming

- 2-space indentation, single quotes, semicolons
- Components: PascalCase files (`SystemCard.tsx`), `export function SystemCard()`
- Server actions: camelCase files (`systems.ts`), camelCase functions (`getSystems`)
- Constants: SCREAMING_SNAKE_CASE (`statusOptions`)
- Interface for props; Type for unions/Prisma-derived types
- NO code comments unless explicitly requested

### React Components

Function declarations (NOT arrow functions). `export default` only for page components.

```typescript
interface SystemListProps {
  systems: System[]
}

export function SystemList({ systems }: SystemListProps) {
  const [error, setError] = useState<string | null>(null)
}
```

### Server Actions

Place in `app/actions/`. Check auth first, throw `Error('Unauthorized')` if missing. Return `{ success: true, data }` or `{ error: string, issues?: ZodIssue[] }`. Always wrap Prisma calls in try/catch with `console.error()` logging. Use `revalidatePath()` after mutations.

### Error Handling & Database

- Server actions: return `{ error: string }` or `{ error: string, issues: ZodIssue[] }`
- Client: `useState<string | null>(null)` with `text-destructive` class
- Prisma: wrap in try/catch, log with `console.error()`
- Import from `@/lib/prisma`. Use `select` to limit fields, `include` for relations

### Form Handling & Authentication

- Use FormData API: `formData.get('name') as string`
- Server-side: `import { auth } from '@/lib/auth'`
- Client-side: `import { signIn, signOut } from 'next-auth/react'`
- Session: `id`, `email`, `name`, `username`, `role` (ADMIN/EDITOR/VIEWER)
- Restrict delete: `if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')`

### UI Components

Use shadcn/ui from `@/components/ui/`. Common: Button, Input, Label, Textarea, Select, Dialog, Card, Badge, Table, Tabs, Avatar, DropdownMenu, ScrollArea, Separator, Sheet.

## Page Components

```typescript
export const dynamic = 'force-dynamic'

interface SystemsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function SystemsPage({ searchParams }: SystemsPageProps) {
  const params = await searchParams
  const systems = await getFilteredSystems(params)
  return <SystemList systems={systems} />
}

// Dynamic route params:
interface EditPageProps {
  params: Promise<{ id: string }>
}
export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const item = await getItem(id)
  if (!item) notFound()
  return <EditForm item={item} />
}
```

## Git Commits & Security

Conventional commits: `feat(diagrams): add signal flow`, `fix(auth): handle timeout`

- Never commit `.env` files or secrets
- Validate all input with Zod schemas in `lib/validations/`
- Always `await auth()` in server actions before data access
- Restrict delete operations to ADMIN/EDITOR roles

## Audit Logging

All CRUD operations on major entities are logged via `lib/audit.ts`:

```typescript
import { createAuditLog, sanitizeForAudit } from '@/lib/audit'

await createAuditLog({
  action: 'CREATE',
  entityType: 'Device',
  entityId: device.id,
  userId: session.user.id,
  changes: { after: sanitizeForAudit(data) },
})
```

## Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

Optional (syslog): `SYSLOG_UDP_PORT`, `SYSLOG_TCP_PORT`, `SYSLOG_HOST`

Optional (snmp): `SNMP_DEFAULT_PORT`, `SNMP_DEFAULT_COMMUNITY`, `SNMP_POLL_INTERVAL`
