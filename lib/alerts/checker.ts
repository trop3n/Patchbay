import { prisma } from '@/lib/prisma'
import { alertConfig, conditionLabels, type AlertCondition, type AlertSeverity } from './config'
import { sendNotifications } from './notifications'
import type { DeviceStatus } from '@prisma/client'

interface AlertCheckContext {
  deviceId?: string
  systemId?: string
  deviceName?: string
  systemName?: string
  previousStatus?: DeviceStatus | null
  newStatus?: DeviceStatus
}

export async function checkAndTriggerAlerts(context: AlertCheckContext): Promise<void> {
  const thresholds = await getMatchingThresholds(context)

  for (const threshold of thresholds) {
    if (!threshold.enabled) continue

    const shouldAlert = await evaluateCondition(threshold.condition, context, threshold)

    if (shouldAlert) {
      await triggerAlert(threshold, context)
    }
  }
}

async function getMatchingThresholds(
  context: AlertCheckContext
): Promise<Array<{
  id: string
  name: string
  condition: AlertCondition
  severity: AlertSeverity
  threshold: number | null
  thresholdUnit: string | null
  enabled: boolean
  notifyEmail: boolean
  notifyWebhook: boolean
  webhookUrl: string | null
  emailRecipients: string | null
  deviceId: string | null
  systemId: string | null
}>> {
  const whereClause: {
    enabled: boolean
    OR: Array<{ deviceId?: string | null; systemId?: string | null }>
  } = {
    enabled: true,
    OR: [],
  }

  if (context.deviceId) {
    whereClause.OR.push({ deviceId: context.deviceId })
    whereClause.OR.push({ deviceId: null, systemId: context.systemId ?? undefined })
    whereClause.OR.push({ deviceId: null, systemId: null })
  } else if (context.systemId) {
    whereClause.OR.push({ systemId: context.systemId })
    whereClause.OR.push({ systemId: null })
  } else {
    whereClause.OR.push({ deviceId: null, systemId: null })
  }

  return prisma.alertThreshold.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      condition: true,
      severity: true,
      threshold: true,
      thresholdUnit: true,
      enabled: true,
      notifyEmail: true,
      notifyWebhook: true,
      webhookUrl: true,
      emailRecipients: true,
      deviceId: true,
      systemId: true,
    },
  })
}

async function evaluateCondition(
  condition: AlertCondition,
  context: AlertCheckContext,
  threshold: { threshold: number | null; thresholdUnit: string | null }
): Promise<boolean> {
  switch (condition) {
    case 'DEVICE_OFFLINE':
      return context.newStatus === 'OFFLINE'

    case 'DEVICE_ERROR':
      return context.newStatus === 'ERROR'

    case 'STATUS_CHANGE':
      return context.previousStatus !== null && context.previousStatus !== context.newStatus

    case 'LOW_UPTIME':
      if (!context.deviceId || !threshold.threshold) return false
      const uptime = await calculateRecentUptime(context.deviceId, threshold.thresholdUnit || 'days')
      return uptime < threshold.threshold

    default:
      return false
  }
}

async function calculateRecentUptime(deviceId: string, unit: string): Promise<number> {
  const startDate = new Date()
  switch (unit) {
    case 'hours':
      startDate.setHours(startDate.getHours() - 24)
      break
    case 'days':
    default:
      startDate.setDate(startDate.getDate() - 30)
      break
  }

  const [onlineCount, totalCount] = await Promise.all([
    prisma.deviceStatusHistory.count({
      where: {
        deviceId,
        recordedAt: { gte: startDate },
        status: 'ONLINE',
      },
    }),
    prisma.deviceStatusHistory.count({
      where: {
        deviceId,
        recordedAt: { gte: startDate },
      },
    }),
  ])

  return totalCount > 0 ? (onlineCount / totalCount) * 100 : 0
}

async function triggerAlert(
  threshold: {
    id: string
    name: string
    condition: AlertCondition
    severity: AlertSeverity
    notifyEmail: boolean
    notifyWebhook: boolean
    webhookUrl: string | null
    emailRecipients: string | null
  },
  context: AlertCheckContext
): Promise<void> {
  const cooldownStart = new Date()
  cooldownStart.setMinutes(cooldownStart.getMinutes() - alertConfig.cooldownMinutes)

  const recentAlert = await prisma.alert.findFirst({
    where: {
      thresholdId: threshold.id,
      deviceId: context.deviceId,
      status: 'ACTIVE',
      createdAt: { gte: cooldownStart },
    },
  })

  if (recentAlert) {
    console.log(`[Alerts] Skipping ${threshold.name} - cooldown active`)
    return
  }

  const message = buildAlertMessage(threshold.condition, context)

  const alert = await prisma.alert.create({
    data: {
      thresholdId: threshold.id,
      deviceId: context.deviceId || null,
      systemId: context.systemId || null,
      severity: threshold.severity,
      status: 'ACTIVE',
      message,
    },
  })

  console.log(`[Alerts] Created alert ${alert.id}: ${message}`)

  await sendNotifications(
    {
      thresholdName: threshold.name,
      condition: conditionLabels[threshold.condition],
      severity: threshold.severity,
      message,
      deviceName: context.deviceName,
      systemName: context.systemName,
      timestamp: alert.createdAt,
    },
    {
      notifyEmail: threshold.notifyEmail,
      notifyWebhook: threshold.notifyWebhook,
      emailRecipients: threshold.emailRecipients,
      webhookUrl: threshold.webhookUrl,
    }
  )
}

function buildAlertMessage(
  condition: AlertCondition,
  context: AlertCheckContext
): string {
  const device = context.deviceName ? `Device "${context.deviceName}"` : 'A device'
  const system = context.systemName ? ` in system "${context.systemName}"` : ''

  switch (condition) {
    case 'DEVICE_OFFLINE':
      return `${device}${system} is now OFFLINE`
    case 'DEVICE_ERROR':
      return `${device}${system} is in ERROR state`
    case 'STATUS_CHANGE':
      return `${device}${system} changed from ${context.previousStatus} to ${context.newStatus}`
    case 'LOW_UPTIME':
      return `${device}${system} has low uptime`
    default:
      return `${device}${system} triggered an alert`
  }
}
