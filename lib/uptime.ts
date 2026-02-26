import { prisma } from '@/lib/prisma'
import { checkAndTriggerAlerts } from '@/lib/alerts/checker'
import type { DeviceStatus } from '@prisma/client'

export interface StatusChangeResult {
  statusChanged: boolean
  previousStatus: DeviceStatus | null
  newStatus: DeviceStatus
}

export async function recordDeviceStatusChange(
  deviceId: string,
  newStatus: DeviceStatus,
  source?: string
): Promise<StatusChangeResult> {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { 
      status: true, 
      name: true, 
      systemId: true,
      system: { select: { id: true, name: true } },
    },
  })

  const previousStatus = device?.status || null
  const statusChanged = previousStatus !== newStatus

  if (statusChanged) {
    await prisma.deviceStatusHistory.create({
      data: {
        deviceId,
        status: newStatus,
        previousStatus,
        source: source || null,
      },
    })

    await prisma.device.update({
      where: { id: deviceId },
      data: {
        status: newStatus,
        lastSeenAt: newStatus === 'ONLINE' ? new Date() : undefined,
      },
    })

    checkAndTriggerAlerts({
      deviceId,
      systemId: device?.systemId,
      deviceName: device?.name,
      systemName: device?.system?.name,
      previousStatus,
      newStatus,
    }).catch((error) => {
      console.error('[Uptime] Error checking alerts:', error)
    })
  }

  return {
    statusChanged,
    previousStatus,
    newStatus,
  }
}

export interface UptimeStats {
  totalChecks: number
  onlineCount: number
  offlineCount: number
  warningCount: number
  errorCount: number
  unknownCount: number
  uptimePercentage: number
  last24Hours: {
    online: number
    offline: number
    warning: number
    error: number
    unknown: number
  }
}

export async function getDeviceUptimeStats(
  deviceId: string,
  days: number = 30
): Promise<UptimeStats> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const history = await prisma.deviceStatusHistory.findMany({
    where: {
      deviceId,
      recordedAt: { gte: startDate },
    },
    select: {
      status: true,
      recordedAt: true,
    },
    orderBy: { recordedAt: 'asc' },
  })

  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)

  const stats = {
    totalChecks: history.length,
    onlineCount: 0,
    offlineCount: 0,
    warningCount: 0,
    errorCount: 0,
    unknownCount: 0,
    uptimePercentage: 0,
    last24Hours: {
      online: 0,
      offline: 0,
      warning: 0,
      error: 0,
      unknown: 0,
    },
  }

  for (const record of history) {
    switch (record.status) {
      case 'ONLINE':
        stats.onlineCount++
        if (record.recordedAt >= last24Hours) stats.last24Hours.online++
        break
      case 'OFFLINE':
        stats.offlineCount++
        if (record.recordedAt >= last24Hours) stats.last24Hours.offline++
        break
      case 'WARNING':
        stats.warningCount++
        if (record.recordedAt >= last24Hours) stats.last24Hours.warning++
        break
      case 'ERROR':
        stats.errorCount++
        if (record.recordedAt >= last24Hours) stats.last24Hours.error++
        break
      case 'UNKNOWN':
        stats.unknownCount++
        if (record.recordedAt >= last24Hours) stats.last24Hours.unknown++
        break
    }
  }

  if (stats.totalChecks > 0) {
    stats.uptimePercentage = (stats.onlineCount / stats.totalChecks) * 100
  }

  return stats
}

export async function getSystemUptimeStats(systemId: string, days: number = 30) {
  const devices = await prisma.device.findMany({
    where: { systemId },
    select: { id: true, name: true, status: true },
  })

  const deviceStats = await Promise.all(
    devices.map(async (device) => ({
      ...device,
      uptime: await getDeviceUptimeStats(device.id, days),
    }))
  )

  const totalDevices = devices.length
  const onlineDevices = deviceStats.filter((d) => d.status === 'ONLINE').length

  return {
    totalDevices,
    onlineDevices,
    offlineDevices: totalDevices - onlineDevices,
    systemUptime:
      totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 100,
    devices: deviceStats,
  }
}
