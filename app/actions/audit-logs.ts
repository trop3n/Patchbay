'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { AuditAction, EntityType } from '@/lib/audit'

export interface AuditLogFilters {
  action?: AuditAction
  entityType?: EntityType
  userId?: string
  entityId?: string
}

export async function getAuditLogs(filters?: AuditLogFilters) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }

  return prisma.auditLog.findMany({
    where: {
      action: filters?.action,
      entityType: filters?.entityType,
      userId: filters?.userId,
      entityId: filters?.entityId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, username: true, email: true } },
    },
    take: 100,
  })
}

export async function getAuditLogsForEntity(entityType: EntityType, entityId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, username: true, email: true } },
    },
  })
}

export async function getAuditLogFilterOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true },
    orderBy: { name: 'asc' },
  })

  return {
    actions: ['CREATE', 'UPDATE', 'DELETE'] as AuditAction[],
    entityTypes: ['System', 'Diagram', 'Document', 'Asset', 'Rack', 'User', 'Attachment'] as EntityType[],
    users,
  }
}
