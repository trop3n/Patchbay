# AGENTS.md

Guidelines for AI coding agents working on Patchbay.

## Project Overview

Patchbay is an A/V technical documentation and diagramming platform built with Next.js 14 (App Router), TypeScript, Prisma, and PostgreSQL.

## Build/Lint/Test Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Development server
npm run build                # Build for production
npm run lint                 # Lint code (ESLint)
npm run typecheck            # Type check (or: npx tsc --noEmit)
npm test                     # Run all tests
npm test -- path/to/test.test.ts           # Run single test file
npm test -- --testNamePattern="test name"  # Run tests by name pattern

npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations (development)
npx prisma migrate deploy    # Run migrations (production)
npx prisma db seed           # Seed database
npx prisma studio            # Open database GUI
```

## Tech Stack

Next.js 14 (App Router), TypeScript 5.x, PostgreSQL + Prisma ORM, NextAuth.js v5, Tailwind CSS + shadcn/ui, React Flow (@xyflow/react), Excalidraw, Zod, Jest + React Testing Library

## Project Structure

```
app/                    # Next.js App Router routes
  (auth)/               # Auth route group
  (dashboard)/          # Protected routes (systems, diagrams, assets, racks)
  actions/              # Server actions
components/
  ui/                   # shadcn/ui components
  diagrams/             # React Flow diagram components
  layout/               # Shared layout components
lib/
  auth.ts               # NextAuth configuration
  prisma.ts             # Prisma client singleton
  validations/          # Zod schemas
prisma/schema.prisma    # Database schema
types/                  # Shared TypeScript types
```

## Code Style Guidelines

### Directives

Place `'use client'` or `'use server'` as the first line before any imports.

### Imports

Order: React/Next.js → Third-party (alphabetical) → `@/` imports (alphabetical) → Relative → Type imports

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { z } from 'zod'
import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

import type { AuthUser } from '@/types'
```

### Formatting

2-space indentation, single quotes, semicolons. No trailing commas in imports; trailing commas in multiline arrays/objects. Max line length: 100 characters.

### React Components

Function declarations (NOT arrow functions). `export default` only for page components; named exports for reusable components. Interface for props: `ComponentNameProps`.

```typescript
interface HeaderProps {
  user: AuthUser
}

export function Header({ user }: HeaderProps) { /* ... */ }

export default function NewSystemPage() { /* ... */ }
```

### Server Actions

Place in `app/actions/`. Start with `'use server'`. Check auth first, throw `Error('Unauthorized')` if missing. Return `{ success: true, data }` or `{ error: string }` for mutations.

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { systemSchema } from '@/lib/validations/system'

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

### Types

Interface for component props and extensible object types. Type for unions and utilities. Avoid `any`; use `unknown` when truly unknown. Re-export Prisma types from `types/index.ts`.

### Naming Conventions

- **Components**: PascalCase files (`SystemCard.tsx`), `export function SystemCard()`
- **Server actions**: camelCase files (`systems.ts`), camelCase functions (`getSystems`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Prisma models**: PascalCase (`System`, `Diagram`)
- **Environment variables**: SCREAMING_SNAKE_CASE (`DATABASE_URL`)

### Database Operations

Import Prisma client from `@/lib/prisma`. Use `select` to limit fields, `include` for relations. Use transactions for related operations.

### Server vs Client Components

Default to Server Components. Use `'use client'` only when needed: hooks, browser APIs, event handlers.

### Testing

Co-locate tests with source files (`Component.test.tsx`). Use AAA pattern: Arrange, Act, Assert.

## Git Commit Messages

Use conventional commits: `feat(diagrams): add signal flow node palette`

## Security

- Never commit `.env` files or secrets
- Validate all input with Zod schemas
- Always check `await auth()` in server actions before data access
- Restrict destructive operations to ADMIN/EDITOR roles
