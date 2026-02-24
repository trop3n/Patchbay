# AGENTS.md

Guidelines for AI coding agents working on Patchbay.

## Build/Lint/Test Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Development server (http://localhost:3000)
npm run build                # Build for production
npm run lint                 # Lint code (ESLint via next lint)
npm run typecheck            # Type check (tsc --noEmit)
npm test                     # Run all tests
npm test -- path/to/test.test.ts           # Run single test file
npm test -- --testNamePattern="test name"  # Run tests by name pattern

npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations (development)
npx prisma db seed           # Seed database
npx prisma studio            # Open database GUI

npm run docker:dev           # Start dev Docker environment
npm run docker:dev:down      # Stop dev Docker environment
```

## Tech Stack & Structure

Next.js 14 (App Router), TypeScript 5.x, PostgreSQL + Prisma ORM, NextAuth.js v5, Tailwind CSS + shadcn/ui, React Flow (@xyflow/react), Excalidraw, Zod, Jest + React Testing Library

```
app/
  (auth)/               # Auth routes (login, error)
  (dashboard)/          # Protected routes (systems, diagrams, assets, racks, documents)
  actions/              # Server actions (systems.ts, diagrams.ts, etc.)
components/
  ui/                   # shadcn/ui components
  diagrams/             # React Flow and Excalidraw components
  layout/               # Header, Sidebar
lib/
  auth.ts               # NextAuth configuration
  prisma.ts             # Prisma client singleton
  utils.ts              # Utility functions (cn)
  validations/          # Zod schemas
prisma/schema.prisma    # Database schema
types/index.ts          # Shared TypeScript types
```

Prisma models: User, System, Diagram, Document, Asset, Device, DeviceLog, Rack, AuditLog
Enums: Role (ADMIN/EDITOR/VIEWER), SystemStatus, DiagramType, AssetStatus, DeviceStatus, ContentType, LogLevel

## Code Style

### Imports & Directives

Place `'use client'` or `'use server'` as the first line. Import order: React/Next.js → Third-party → `@/` imports → Type imports. Separate groups with blank lines.

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createSystem } from '@/app/actions/systems'

import type { AuthUser } from '@/types'
```

### Formatting & Naming

- 2-space indentation, single quotes, semicolons
- No trailing commas in imports; trailing commas in multiline arrays/objects
- Components: PascalCase files (`SystemCard.tsx`), `export function SystemCard()`
- Server actions: camelCase files (`systems.ts`), camelCase functions (`getSystems`)
- Constants: SCREAMING_SNAKE_CASE (`statusOptions`)
- Interface for props/extensible objects; Type for unions/Prisma-derived types
- Avoid `any`; use `unknown` when truly unknown

### React Components

Function declarations (NOT arrow functions). `export default` only for page components; named exports for reusable components. Define interfaces for props above component.

### Server Actions

Place in `app/actions/`. Check auth first, throw `Error('Unauthorized')` if missing. Return `{ success: true, data }` or `{ error: string, issues?: ZodIssue[] }`.

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { systemSchema, type SystemInput } from '@/lib/validations/system'

export async function createSystem(data: SystemInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = systemSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const system = await prisma.system.create({
      data: { ...validated.data, createdById: session.user.id },
    })
    revalidatePath('/systems')
    return { success: true, system }
  } catch (error) {
    console.error('Failed to create system:', error)
    return { error: 'Failed to create system' }
  }
}
```

### Error Handling

- Server actions: return `{ error: string }` or `{ error: string, issues: ZodIssue[] }`
- Client: `useState<string | null>` with `text-destructive` class
- Prisma: wrap in try/catch, log with `console.error()`

### Database Operations

Import from `@/lib/prisma`. Use `select` to limit fields, `include` for relations.

```typescript
return prisma.system.findMany({
  orderBy: { createdAt: 'desc' },
  include: {
    createdBy: { select: { name: true, username: true } },
    _count: { select: { diagrams: true, assets: true } },
  },
})
```

### Form Handling

Use FormData API. Extract with `formData.get('name') as string`.

### Authentication

- Server-side: `import { auth } from '@/lib/auth'`
- Client-side: `import { signIn, signOut } from 'next-auth/react'`
- Session user: `id`, `email`, `name`, `username`, `role` (ADMIN/EDITOR/VIEWER)
- Restrict delete operations: `if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')`

### UI Components

Use shadcn/ui from `@/components/ui/`. Common: Button, Input, Label, Textarea, Select, Dialog, Card, Badge, Table, Tabs, Avatar, DropdownMenu, ScrollArea, Separator, Sheet.

### Diagram Components

- React Flow: `@/components/diagrams/diagram-editor.tsx`, `av-node.tsx`
- Excalidraw: `@/components/diagrams/excalidraw-editor.tsx`, `excalidraw-viewer.tsx`

## Git Commits

Conventional commits: `feat(diagrams): add signal flow`, `fix(auth): handle timeout`

## Security

- Never commit `.env` files or secrets
- Validate all input with Zod schemas in `lib/validations/`
- Always `await auth()` in server actions before data access
- Restrict delete operations to ADMIN/EDITOR roles
