'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { SystemStatus } from '@prisma/client'

export interface DeviceHealthStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
  unknown: number
}

export interface SystemHealth {
  id: string
  name: string
  slug: string
  status: SystemStatus
  location: string | null
  deviceCount: number
  deviceStats: DeviceHealthStats
}

export interface DashboardStats {
  totalSystems: number
  totalDevices: DeviceHealthStats
  systemsOperational: number
  systemsDegraded: number
  systemsOffline: number
  systemsHealth: SystemHealth[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const [systems, devices] = await Promise.all([
    prisma.system.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        location: true,
        devices: {
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.device.findMany({
      select: { status: true },
    }),
  ])

  const totalDevices: DeviceHealthStats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'ONLINE').length,
    offline: devices.filter((d) => d.status === 'OFFLINE').length,
    warning: devices.filter((d) => d.status === 'WARNING').length,
    error: devices.filter((d) => d.status === 'ERROR').length,
    unknown: devices.filter((d) => d.status === 'UNKNOWN').length,
  }

  const systemsHealth: SystemHealth[] = systems.map((system) => {
    const deviceStats: DeviceHealthStats = {
      total: system.devices.length,
      online: system.devices.filter((d) => d.status === 'ONLINE').length,
      offline: system.devices.filter((d) => d.status === 'OFFLINE').length,
      warning: system.devices.filter((d) => d.status === 'WARNING').length,
      error: system.devices.filter((d) => d.status === 'ERROR').length,
      unknown: system.devices.filter((d) => d.status === 'UNKNOWN').length,
    }

    return {
      id: system.id,
      name: system.name,
      slug: system.slug,
      status: system.status,
      location: system.location,
      deviceCount: system.devices.length,
      deviceStats,
    }
  })

  return {
    totalSystems: systems.length,
    totalDevices,
    systemsOperational: systems.filter((s) => s.status === 'OPERATIONAL').length,
    systemsDegraded: systems.filter((s) => s.status === 'DEGRADED').length,
    systemsOffline: systems.filter((s) => s.status === 'OFFLINE' || s.status === 'MAINTENANCE').length,
    systemsHealth,
  }
}

export async function getRecentAlerts(limit = 10) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const offlineOrErrorDevices = await prisma.device.findMany({
    where: {
      OR: [
        { status: 'OFFLINE' },
        { status: 'ERROR' },
        { status: 'WARNING' },
      ],
    },
    include: {
      system: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })

  return offlineOrErrorDevices.map((device) => ({
    id: device.id,
    name: device.name,
    status: device.status,
    deviceType: device.deviceType,
    systemId: device.system?.id,
    systemName: device.system?.name,
    lastSeenAt: device.lastSeenAt,
  }))
}
