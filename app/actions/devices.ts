'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { deviceSchema, deviceUpdateSchema, type DeviceInput, type DeviceUpdateInput } from '@/lib/validations/device'
import { createAuditLog, sanitizeForAudit } from '@/lib/audit'
import type { DeviceStatus } from '@prisma/client'

export async function getDevices(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.device.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
    },
  })
}

export interface DeviceFilters {
  search?: string
  status?: DeviceStatus
  systemId?: string
  deviceType?: string
}

export async function getFilteredDevices(filters: DeviceFilters) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const where: {
    OR?: Array<
      { name: { contains: string; mode: 'insensitive' } } |
      { ipAddress: { contains: string; mode: 'insensitive' } } |
      { model: { contains: string; mode: 'insensitive' } }
    >
    status?: DeviceStatus
    systemId?: string
    deviceType?: string
  } = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { ipAddress: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.systemId) {
    where.systemId = filters.systemId
  }

  if (filters.deviceType) {
    where.deviceType = filters.deviceType
  }

  return prisma.device.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function getDeviceFilterOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const [systems, deviceTypes] = await Promise.all([
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.device.findMany({
      where: { deviceType: { not: null } },
      select: { deviceType: true },
      distinct: ['deviceType'],
    }),
  ])

  return {
    systems,
    deviceTypes: deviceTypes.map((d) => d.deviceType).filter(Boolean) as string[],
  }
}

export async function getDevice(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.device.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      logs: {
        orderBy: { timestamp: 'desc' },
        take: 50,
      },
    },
  })
}

export async function createDevice(data: DeviceInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = deviceSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const device = await prisma.device.create({
      data: {
        name: validated.data.name,
        ipAddress: validated.data.ipAddress || null,
        macAddress: validated.data.macAddress || null,
        deviceType: validated.data.deviceType || null,
        manufacturer: validated.data.manufacturer || null,
        model: validated.data.model || null,
        status: validated.data.status || 'UNKNOWN',
        snmpEnabled: validated.data.snmpEnabled ?? false,
        snmpVersion: validated.data.snmpVersion || null,
        snmpCommunity: validated.data.snmpCommunity || null,
        snmpPort: validated.data.snmpPort ?? 161,
        systemId: validated.data.systemId,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Device',
      entityId: device.id,
      userId: session.user.id,
      changes: { after: sanitizeForAudit(validated.data) },
    })
    revalidatePath('/devices')
    revalidatePath(`/systems/${validated.data.systemId}`)
    return { success: true, device }
  } catch (error) {
    console.error('Failed to create device:', error)
    return { error: 'Failed to create device' }
  }
}

export async function updateDevice(id: string, data: DeviceUpdateInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = deviceUpdateSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const before = await prisma.device.findUnique({ where: { id } })

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: validated.data.name,
        ipAddress: validated.data.ipAddress,
        macAddress: validated.data.macAddress,
        deviceType: validated.data.deviceType,
        manufacturer: validated.data.manufacturer,
        model: validated.data.model,
        status: validated.data.status,
        snmpEnabled: validated.data.snmpEnabled,
        snmpVersion: validated.data.snmpVersion,
        snmpCommunity: validated.data.snmpCommunity,
        snmpPort: validated.data.snmpPort,
        ...(validated.data.systemId && { system: { connect: { id: validated.data.systemId } } }),
      },
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'Device',
      entityId: device.id,
      userId: session.user.id,
      changes: { before: before ? { name: before.name, status: before.status } : undefined, after: { ...validated.data } },
    })
    revalidatePath('/devices')
    revalidatePath(`/devices/${id}`)
    if (device.systemId) {
      revalidatePath(`/systems/${device.systemId}`)
    }
    if (before?.systemId && before.systemId !== device.systemId) {
      revalidatePath(`/systems/${before.systemId}`)
    }
    return { success: true, device }
  } catch (error) {
    console.error('Failed to update device:', error)
    return { error: 'Failed to update device' }
  }
}

export async function updateDeviceStatus(id: string, status: DeviceStatus) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const before = await prisma.device.findUnique({ where: { id } })
    const device = await prisma.device.update({
      where: { id },
      data: { 
        status,
        lastSeenAt: status === 'ONLINE' ? new Date() : before?.lastSeenAt,
      },
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'Device',
      entityId: device.id,
      userId: session.user.id,
      changes: { before: { status: before?.status }, after: { status } },
    })
    revalidatePath('/devices')
    revalidatePath(`/devices/${id}`)
    if (device.systemId) {
      revalidatePath(`/systems/${device.systemId}`)
    }
    return { success: true, device }
  } catch (error) {
    console.error('Failed to update device status:', error)
    return { error: 'Failed to update device status' }
  }
}

export async function deleteDevice(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const device = await prisma.device.findUnique({
      where: { id },
      select: { systemId: true, name: true, status: true },
    })
    await prisma.device.delete({ where: { id } })
    await createAuditLog({
      action: 'DELETE',
      entityType: 'Device',
      entityId: id,
      userId: session.user.id,
      changes: { before: device ? { name: device.name, status: device.status } : undefined },
    })
    revalidatePath('/devices')
    if (device?.systemId) {
      revalidatePath(`/systems/${device.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete device:', error)
    return { error: 'Failed to delete device' }
  }
}
