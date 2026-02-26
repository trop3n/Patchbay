import { prisma } from '@/lib/prisma'

export interface RetentionStats {
  deviceLogsDeleted: number
  statusHistoryDeleted: number
  alertsDeleted: number
  resolvedAlertsDeleted: number
  runAt: Date
}

export async function getRetentionPolicy() {
  let policy = await prisma.retentionPolicy.findFirst()

  if (!policy) {
    policy = await prisma.retentionPolicy.create({
      data: {
        name: 'Default Policy',
        deviceLogRetentionDays: 30,
        statusHistoryRetentionDays: 90,
        alertRetentionDays: 30,
        resolvedAlertRetentionDays: 7,
        enabled: true,
      },
    })
  }

  return policy
}

export async function runRetentionCleanup(): Promise<RetentionStats> {
  const stats: RetentionStats = {
    deviceLogsDeleted: 0,
    statusHistoryDeleted: 0,
    alertsDeleted: 0,
    resolvedAlertsDeleted: 0,
    runAt: new Date(),
  }

  const policy = await getRetentionPolicy()

  if (!policy.enabled) {
    console.log('[Retention] Cleanup is disabled')
    return stats
  }

  console.log('[Retention] Starting cleanup with policy:', {
    deviceLogDays: policy.deviceLogRetentionDays,
    statusHistoryDays: policy.statusHistoryRetentionDays,
    alertDays: policy.alertRetentionDays,
    resolvedAlertDays: policy.resolvedAlertRetentionDays,
  })

  const deviceLogCutoff = new Date()
  deviceLogCutoff.setDate(deviceLogCutoff.getDate() - policy.deviceLogRetentionDays)

  const statusHistoryCutoff = new Date()
  statusHistoryCutoff.setDate(statusHistoryCutoff.getDate() - policy.statusHistoryRetentionDays)

  const alertCutoff = new Date()
  alertCutoff.setDate(alertCutoff.getDate() - policy.alertRetentionDays)

  const resolvedAlertCutoff = new Date()
  resolvedAlertCutoff.setDate(resolvedAlertCutoff.getDate() - policy.resolvedAlertRetentionDays)

  try {
    const deletedDeviceLogs = await prisma.deviceLog.deleteMany({
      where: {
        timestamp: { lt: deviceLogCutoff },
      },
    })
    stats.deviceLogsDeleted = deletedDeviceLogs.count
    console.log(`[Retention] Deleted ${stats.deviceLogsDeleted} device logs`)
  } catch (error) {
    console.error('[Retention] Error deleting device logs:', error)
  }

  try {
    const deletedStatusHistory = await prisma.deviceStatusHistory.deleteMany({
      where: {
        recordedAt: { lt: statusHistoryCutoff },
      },
    })
    stats.statusHistoryDeleted = deletedStatusHistory.count
    console.log(`[Retention] Deleted ${stats.statusHistoryDeleted} status history records`)
  } catch (error) {
    console.error('[Retention] Error deleting status history:', error)
  }

  try {
    const deletedAlerts = await prisma.alert.deleteMany({
      where: {
        createdAt: { lt: alertCutoff },
        status: { not: 'RESOLVED' },
      },
    })
    stats.alertsDeleted = deletedAlerts.count
    console.log(`[Retention] Deleted ${stats.alertsDeleted} non-resolved alerts`)
  } catch (error) {
    console.error('[Retention] Error deleting alerts:', error)
  }

  try {
    const deletedResolvedAlerts = await prisma.alert.deleteMany({
      where: {
        createdAt: { lt: resolvedAlertCutoff },
        status: 'RESOLVED',
      },
    })
    stats.resolvedAlertsDeleted = deletedResolvedAlerts.count
    console.log(`[Retention] Deleted ${stats.resolvedAlertsDeleted} resolved alerts`)
  } catch (error) {
    console.error('[Retention] Error deleting resolved alerts:', error)
  }

  try {
    await prisma.retentionPolicy.update({
      where: { id: policy.id },
      data: { lastCleanupAt: new Date() },
    })
  } catch (error) {
    console.error('[Retention] Error updating last cleanup time:', error)
  }

  console.log('[Retention] Cleanup complete:', stats)
  return stats
}

export async function getRetentionStats() {
  const policy = await getRetentionPolicy()

  const deviceLogCutoff = new Date()
  deviceLogCutoff.setDate(deviceLogCutoff.getDate() - policy.deviceLogRetentionDays)

  const statusHistoryCutoff = new Date()
  statusHistoryCutoff.setDate(statusHistoryCutoff.getDate() - policy.statusHistoryRetentionDays)

  const alertCutoff = new Date()
  alertCutoff.setDate(alertCutoff.getDate() - policy.alertRetentionDays)

  const resolvedAlertCutoff = new Date()
  resolvedAlertCutoff.setDate(resolvedAlertCutoff.getDate() - policy.resolvedAlertRetentionDays)

  const [
    totalDeviceLogs,
    deviceLogsToDelete,
    totalStatusHistory,
    statusHistoryToDelete,
    totalAlerts,
    alertsToDelete,
    totalResolvedAlerts,
    resolvedAlertsToDelete,
  ] = await Promise.all([
    prisma.deviceLog.count(),
    prisma.deviceLog.count({ where: { timestamp: { lt: deviceLogCutoff } } }),
    prisma.deviceStatusHistory.count(),
    prisma.deviceStatusHistory.count({ where: { recordedAt: { lt: statusHistoryCutoff } } }),
    prisma.alert.count({ where: { status: { not: 'RESOLVED' } } }),
    prisma.alert.count({ where: { createdAt: { lt: alertCutoff }, status: { not: 'RESOLVED' } } }),
    prisma.alert.count({ where: { status: 'RESOLVED' } }),
    prisma.alert.count({ where: { createdAt: { lt: resolvedAlertCutoff }, status: 'RESOLVED' } }),
  ])

  return {
    policy,
    deviceLogs: {
      total: totalDeviceLogs,
      toDelete: deviceLogsToDelete,
      cutoffDate: deviceLogCutoff,
    },
    statusHistory: {
      total: totalStatusHistory,
      toDelete: statusHistoryToDelete,
      cutoffDate: statusHistoryCutoff,
    },
    alerts: {
      total: totalAlerts,
      toDelete: alertsToDelete,
      cutoffDate: alertCutoff,
    },
    resolvedAlerts: {
      total: totalResolvedAlerts,
      toDelete: resolvedAlertsToDelete,
      cutoffDate: resolvedAlertCutoff,
    },
  }
}
