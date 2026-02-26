'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog, sanitizeForAudit } from '@/lib/audit'
import type { AlertCondition, AlertSeverity } from '@prisma/client'

export interface AlertThresholdInput {
  name: string
  description?: string
  condition: AlertCondition
  severity: AlertSeverity
  threshold?: number
  thresholdUnit?: string
  enabled: boolean
  notifyEmail: boolean
  notifyWebhook: boolean
  webhookUrl?: string
  emailRecipients?: string
  systemId?: string
  deviceId?: string
  [key: string]: unknown
}

export async function getAlertThresholds() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.alertThreshold.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      system: { select: { id: true, name: true } },
      device: { select: { id: true, name: true, system: { select: { id: true, name: true } } } },
      createdBy: { select: { name: true, username: true } },
      _count: { select: { alerts: true } },
    },
  })
}

export async function getAlertThreshold(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.alertThreshold.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true } },
      device: { select: { id: true, name: true, systemId: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function createAlertThreshold(data: AlertThresholdInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const threshold = await prisma.alertThreshold.create({
      data: {
        name: data.name,
        description: data.description || null,
        condition: data.condition,
        severity: data.severity,
        threshold: data.threshold || null,
        thresholdUnit: data.thresholdUnit || null,
        enabled: data.enabled,
        notifyEmail: data.notifyEmail,
        notifyWebhook: data.notifyWebhook,
        webhookUrl: data.webhookUrl || null,
        emailRecipients: data.emailRecipients || null,
        systemId: data.systemId || null,
        deviceId: data.deviceId || null,
        createdById: session.user.id,
      },
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'AlertThreshold',
      entityId: threshold.id,
      userId: session.user.id,
      changes: { after: sanitizeForAudit(data) },
    })

    revalidatePath('/settings/alerts')
    return { success: true, threshold }
  } catch (error) {
    console.error('Failed to create alert threshold:', error)
    return { error: 'Failed to create alert threshold' }
  }
}

export async function updateAlertThreshold(id: string, data: Partial<AlertThresholdInput>) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const before = await prisma.alertThreshold.findUnique({ where: { id } })

    const threshold = await prisma.alertThreshold.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        condition: data.condition,
        severity: data.severity,
        threshold: data.threshold,
        thresholdUnit: data.thresholdUnit,
        enabled: data.enabled,
        notifyEmail: data.notifyEmail,
        notifyWebhook: data.notifyWebhook,
        webhookUrl: data.webhookUrl,
        emailRecipients: data.emailRecipients,
        systemId: data.systemId,
        deviceId: data.deviceId,
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'AlertThreshold',
      entityId: threshold.id,
      userId: session.user.id,
      changes: { before: before ? sanitizeForAudit(before) : undefined, after: sanitizeForAudit(data) },
    })

    revalidatePath('/settings/alerts')
    return { success: true, threshold }
  } catch (error) {
    console.error('Failed to update alert threshold:', error)
    return { error: 'Failed to update alert threshold' }
  }
}

export async function deleteAlertThreshold(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const threshold = await prisma.alertThreshold.findUnique({ where: { id } })
    await prisma.alertThreshold.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'AlertThreshold',
      entityId: id,
      userId: session.user.id,
      changes: { before: threshold ? sanitizeForAudit(threshold) : undefined },
    })

    revalidatePath('/settings/alerts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete alert threshold:', error)
    return { error: 'Failed to delete alert threshold' }
  }
}

export async function getAlerts(options?: {
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  limit?: number
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.alert.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    include: {
      threshold: { select: { id: true, name: true, condition: true } },
      device: { select: { id: true, name: true } },
      system: { select: { id: true, name: true } },
    },
  })
}

export async function acknowledgeAlert(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: session.user.id,
      },
    })

    revalidatePath('/settings/alerts')
    return { success: true, alert }
  } catch (error) {
    console.error('Failed to acknowledge alert:', error)
    return { error: 'Failed to acknowledge alert' }
  }
}

export async function resolveAlert(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    })

    revalidatePath('/settings/alerts')
    return { success: true, alert }
  } catch (error) {
    console.error('Failed to resolve alert:', error)
    return { error: 'Failed to resolve alert' }
  }
}

export async function resolveAllAlerts() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const result = await prisma.alert.updateMany({
      where: { status: 'ACTIVE' },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    })

    revalidatePath('/settings/alerts')
    return { success: true, count: result.count }
  } catch (error) {
    console.error('Failed to resolve all alerts:', error)
    return { error: 'Failed to resolve all alerts' }
  }
}
