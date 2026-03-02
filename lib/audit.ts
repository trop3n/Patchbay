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
  | 'AlertThreshold'

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
    return await prisma.auditLog.create({
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

const SENSITIVE_FIELDS = new Set([
  'password',
  'hashedPassword',
  'snmpCommunity',
  'webhookUrl',
  'smtpPass',
  'secret',
  'token',
  'apiKey',
])

export function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]'
    }
  }
  return sanitized
}
