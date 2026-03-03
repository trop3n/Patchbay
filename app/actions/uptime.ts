'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { DeviceStatus } from '@prisma/client'

export interface DeviceUptimeStats {
  deviceId: string
  deviceName: string
  currentStatus: DeviceStatus
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
  recentHistory: Array<{
    status: DeviceStatus
    previousStatus: DeviceStatus | null
    source: string | null
    recordedAt: Date
  }>
}

export async function getDeviceUptimeStats(
  deviceId: string,
  days: number = 30
): Promise<DeviceUptimeStats | null> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { name: true, status: true },
  })

  if (!device) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const history = await prisma.deviceStatusHistory.findMany({
    where: {
      deviceId,
      recordedAt: { gte: startDate },
    },
    select: {
      status: true,
      previousStatus: true,
      source: true,
      recordedAt: true,
    },
    orderBy: { recordedAt: 'desc' },
  })

  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)

  const stats: DeviceUptimeStats = {
    deviceId,
    deviceName: device.name,
    currentStatus: device.status,
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
    recentHistory: history.slice(0, 50),
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

export interface SystemUptimeSummary {
  systemId: string
  systemName: string
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  warningDevices: number
  errorDevices: number
  unknownDevices: number
  systemUptime: number
  devices: Array<{
    id: string
    name: string
    status: DeviceStatus
    uptimePercentage: number
    lastSeenAt: Date | null
  }>
}

export async function getSystemUptimeSummary(
  systemId: string,
  days: number = 30
): Promise<SystemUptimeSummary | null> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const system = await prisma.system.findUnique({
    where: { id: systemId },
    select: { name: true },
  })

  if (!system) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [devices, historyGroups] = await Promise.all([
    prisma.device.findMany({
      where: { systemId },
      select: {
        id: true,
        name: true,
        status: true,
        lastSeenAt: true,
      },
    }),
    prisma.deviceStatusHistory.groupBy({
      by: ['deviceId', 'status'],
      where: {
        device: { systemId },
        recordedAt: { gte: startDate },
      },
      _count: true,
    }),
  ])

  const uptimeMap = new Map<string, { online: number; total: number }>()
  for (const group of historyGroups) {
    const entry = uptimeMap.get(group.deviceId) ?? { online: 0, total: 0 }
    entry.total += group._count
    if (group.status === 'ONLINE') entry.online += group._count
    uptimeMap.set(group.deviceId, entry)
  }

  const deviceStats = devices.map((device) => {
    const counts = uptimeMap.get(device.id) ?? { online: 0, total: 0 }
    return {
      id: device.id,
      name: device.name,
      status: device.status,
      uptimePercentage: counts.total > 0 ? (counts.online / counts.total) * 100 : 0,
      lastSeenAt: device.lastSeenAt,
    }
  })

  const onlineDevices = deviceStats.filter((d) => d.status === 'ONLINE').length
  const offlineDevices = deviceStats.filter((d) => d.status === 'OFFLINE').length
  const warningDevices = deviceStats.filter((d) => d.status === 'WARNING').length
  const errorDevices = deviceStats.filter((d) => d.status === 'ERROR').length
  const unknownDevices = deviceStats.filter((d) => d.status === 'UNKNOWN').length

  return {
    systemId,
    systemName: system.name,
    totalDevices: devices.length,
    onlineDevices,
    offlineDevices,
    warningDevices,
    errorDevices,
    unknownDevices,
    systemUptime: devices.length > 0 ? (onlineDevices / devices.length) * 100 : 100,
    devices: deviceStats,
  }
}

export async function getAllDevicesUptime(days: number = 30) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [devices, historyGroups] = await Promise.all([
    prisma.device.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        lastSeenAt: true,
        system: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.deviceStatusHistory.groupBy({
      by: ['deviceId', 'status'],
      where: { recordedAt: { gte: startDate } },
      _count: true,
    }),
  ])

  // Build lookup: deviceId -> { online, total }
  const uptimeMap = new Map<string, { online: number; total: number }>()
  for (const group of historyGroups) {
    const entry = uptimeMap.get(group.deviceId) ?? { online: 0, total: 0 }
    entry.total += group._count
    if (group.status === 'ONLINE') entry.online += group._count
    uptimeMap.set(group.deviceId, entry)
  }

  return devices.map((device) => {
    const counts = uptimeMap.get(device.id) ?? { online: 0, total: 0 }
    return {
      id: device.id,
      name: device.name,
      status: device.status,
      lastSeenAt: device.lastSeenAt,
      system: device.system,
      uptimePercentage: counts.total > 0 ? (counts.online / counts.total) * 100 : 0,
      totalChecks: counts.total,
    }
  })
}
