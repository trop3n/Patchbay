'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { systemSchema, type SystemInput } from '@/lib/validations/system'
import { createAuditLog, sanitizeForAudit } from '@/lib/audit'
import type { SystemStatus } from '@prisma/client'

export async function getSystems() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.system.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, username: true } },
      _count: { select: { diagrams: true, assets: true, devices: true } },
    },
  })
}

export interface SystemFilters {
  search?: string
  status?: SystemStatus
  category?: string
}

export async function getFilteredSystems(filters: SystemFilters) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const where: {
    OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } } | { location: { contains: string; mode: 'insensitive' } }>
    status?: SystemStatus
    category?: string
  } = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.category) {
    where.category = filters.category
  }

  return prisma.system.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, username: true } },
      _count: { select: { diagrams: true, assets: true, devices: true } },
    },
  })
}

export async function getSystemFilterOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const categories = await prisma.system.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  })

  return {
    categories: categories.map((s) => s.category).filter(Boolean) as string[],
  }
}

export async function getSystem(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.system.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, username: true, email: true } },
      diagrams: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
      assets: {
        orderBy: { name: 'asc' },
      },
      devices: {
        orderBy: { name: 'asc' },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
    },
  })
}

export async function createSystem(data: SystemInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = systemSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const system = await prisma.system.create({
      data: {
        ...validated.data,
        createdById: session.user.id,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'System',
      entityId: system.id,
      userId: session.user.id,
      changes: { after: sanitizeForAudit(validated.data) },
    })
    revalidatePath('/systems')
    return { success: true, system }
  } catch (error) {
    console.error('Failed to create system:', error)
    return { error: 'Failed to create system' }
  }
}

export async function updateSystem(id: string, data: Partial<SystemInput>) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = systemSchema.partial().safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const before = await prisma.system.findUnique({ where: { id } })
    const system = await prisma.system.update({
      where: { id },
      data: validated.data,
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'System',
      entityId: system.id,
      userId: session.user.id,
      changes: { before: before ? sanitizeForAudit(before) : undefined, after: sanitizeForAudit(validated.data) },
    })
    revalidatePath('/systems')
    revalidatePath(`/systems/${id}`)
    return { success: true, system }
  } catch (error) {
    console.error('Failed to update system:', error)
    return { error: 'Failed to update system' }
  }
}

export async function deleteSystem(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const system = await prisma.system.findUnique({ where: { id } })
    await prisma.system.delete({ where: { id } })
    await createAuditLog({
      action: 'DELETE',
      entityType: 'System',
      entityId: id,
      userId: session.user.id,
      changes: { before: system ? sanitizeForAudit(system) : undefined },
    })
    revalidatePath('/systems')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete system:', error)
    return { error: 'Failed to delete system' }
  }
}
