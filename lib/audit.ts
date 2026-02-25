import { prisma } from '@/lib/prisma'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type EntityType = 
  | 'System'
  | 'Diagram'
  | 'Document'
  | 'Asset'
  | 'Rack'
  | 'User'
  | 'Attachment'
  | 'Device'

interface CreateAuditLogInput {
  action: AuditAction
  entityType: EntityType
  entityId: string
  userId: string
  changes?: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }
}

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    return prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        changes: input.changes ? (input.changes as object) : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  delete sanitized.password
  delete sanitized.hashedPassword
  return sanitized
}
