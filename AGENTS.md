# AGENTS.md

Guidelines for AI coding agents working on Patchbay.

## Project Overview

Patchbay is an A/V technical documentation and diagramming platform built with Next.js 14 (App Router), TypeScript, Prisma, and PostgreSQL.

## Build/Lint/Test Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Development server
npm run build                # Build for production
npm run lint                 # Lint code
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

Next.js 14 (App Router), TypeScript 5.x, PostgreSQL + Prisma ORM, NextAuth.js v5 (local credentials), Tailwind CSS + shadcn/ui, React Flow + Excalidraw, Zod, Jest + React Testing Library

## Project Structure

```
app/                    # Next.js App Router routes
  (auth)/               # Auth route group (login, error)
  (dashboard)/          # Protected routes (systems, diagrams, assets)
  api/                  # API route handlers
components/
  ui/                   # shadcn/ui components
  diagrams/             # React Flow and Excalidraw components
  systems/              # System-related components
  assets/               # Asset-related components
  layout/               # Shared layout components
lib/
  auth.ts               # NextAuth configuration
  prisma.ts             # Prisma client singleton
  validations/          # Zod schemas
  utils.ts              # Shared utilities
prisma/
  schema.prisma         # Database schema
  seed.ts               # Database seeding
types/                  # Shared TypeScript types
```

## Code Style Guidelines

### Imports

Order: React/Next.js → Third-party (alphabetical) → `@/` imports (alphabetical) → Relative → Type imports

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { z } from 'zod'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

import type { System } from '@/types'
```

### Formatting

- 2-space indentation, single quotes, semicolons
- No trailing commas in imports, trailing commas in multiline arrays/objects
- Max line length: 100 characters

### Types

- Explicit return types for functions
- `interface` for extensible object types, `type` for unions/utilities
- Avoid `any`; use `unknown` when type is truly unknown
- Define shared types in `types/index.ts`

### Naming Conventions

- **Components**: PascalCase (`SystemCard.tsx`, `export function SystemCard()`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Database models**: PascalCase (`System`, `Diagram`)
- **API routes**: kebab-case (`/api/systems/[id]/route.ts`)
- **Environment variables**: SCREAMING_SNAKE_CASE (`DATABASE_URL`, `NEXTAUTH_SECRET`)

### Error Handling

- Use `Result` pattern in server actions: `{ success: true, data }` or `{ error: string }`
- Validate input with Zod before processing
- Log errors server-side with context

```typescript
export async function createSystem(formData: FormData) {
  const validated = systemSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }
  try {
    const system = await prisma.system.create({ data: validated.data })
    return { success: true, system }
  } catch (error) {
    console.error('Failed to create system:', error)
    return { error: 'Failed to create system' }
  }
}
```

### React Components

- Function components with arrow functions
- `export default` only for page components
- Keep components < 200 lines, extract complex logic to hooks

### Server vs Client Components

- Default to Server Components
- Use `"use client"` only when needed: hooks, browser APIs, event handlers

### Database Operations

- Use Prisma client from `@/lib/prisma`
- Use transactions for related operations
- Select only needed fields

### Testing

- Co-locate tests (`Component.test.tsx`)
- AAA pattern: Arrange, Act, Assert
- Descriptive test names

## Git Commit Messages

Use conventional commits format, keep first line under 72 characters:

```
feat(diagrams): add signal flow node palette
fix(auth): handle invalid credentials
```

## Security

- Never commit `.env` files or secrets
- Validate all input with Zod
- Use parameterized queries (Prisma handles this)
- Sanitize HTML before rendering user content
