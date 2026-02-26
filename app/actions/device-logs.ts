'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { LogLevel } from '@prisma/client'

export interface LogFilters {
  deviceId?: string
  level?: LogLevel
  search?: string
  startDate?: Date
  endDate?: Date
  source?: string
}

export interface DeviceLogWithDevice {
  id: string
  deviceId: string
  level: LogLevel
  message: string
  source: string | null
  rawLog: string | null
  timestamp: Date
  device: {
    id: string
    name: string
    ipAddress: string | null
    system: {
      id: string
      name: string
    } | null
  }
}

export async function getDeviceLogs(
  filters: LogFilters = {},
  page = 1,
  pageSize = 50
): Promise<{ logs: DeviceLogWithDevice[]; total: number }> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const where = {
    ...(filters.deviceId && { deviceId: filters.deviceId }),
    ...(filters.level && { level: filters.level }),
    ...(filters.source && { source: { contains: filters.source, mode: 'insensitive' as const } }),
    ...(filters.search && {
      OR: [
        { message: { contains: filters.search, mode: 'insensitive' as const } },
        { rawLog: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(filters.startDate && { timestamp: { gte: filters.startDate } }),
    ...(filters.endDate && { timestamp: { lte: filters.endDate } }),
  }

  const [logs, total] = await Promise.all([
    prisma.deviceLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        device: {
          select: {
            id: true,
            name: true,
            ipAddress: true,
            system: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.deviceLog.count({ where }),
  ])

  return { logs, total }
}

export async function getLogsForDevice(
  deviceId: string,
  filters: Omit<LogFilters, 'deviceId'> = {},
  page = 1,
  pageSize = 50
): Promise<{ logs: DeviceLogWithDevice[]; total: number }> {
  return getDeviceLogs({ ...filters, deviceId }, page, pageSize)
}

export async function getLogFilterOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const [devices, sources] = await Promise.all([
    prisma.device.findMany({
      select: {
        id: true,
        name: true,
        ipAddress: true,
        system: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.deviceLog.findMany({
      select: { source: true },
      distinct: ['source'],
    }),
  ])

  return {
    levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as LogLevel[],
    devices,
    sources: sources.map((s) => s.source).filter(Boolean) as string[],
  }
}

export async function getLogStats() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [total, last24h, last7d, byLevel] = await Promise.all([
    prisma.deviceLog.count(),
    prisma.deviceLog.count({ where: { timestamp: { gte: last24Hours } } }),
    prisma.deviceLog.count({ where: { timestamp: { gte: last7Days } } }),
    prisma.deviceLog.groupBy({
      by: ['level'],
      _count: true,
    }),
  ])

  return {
    total,
    last24h,
    last7d,
    byLevel: Object.fromEntries(byLevel.map((l) => [l.level, l._count])),
  }
}

export async function deleteOldLogs(olderThanDays: number): Promise<{ deleted: number }> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const result = await prisma.deviceLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate },
    },
  })

  return { deleted: result.count }
}
