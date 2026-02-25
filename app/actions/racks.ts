'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export interface RackUnit {
  position: number
  height: number
  assetId?: string
  label?: string
  manufacturer?: string
  model?: string
}

export async function getRacks(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.rack.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getRack(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.rack.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
    },
  })
}

interface CreateRackInput {
  name: string
  location?: string
  height: number
  systemId?: string
  units?: RackUnit[]
}

export async function createRack(data: CreateRackInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const rack = await prisma.rack.create({
      data: {
        name: data.name,
        location: data.location,
        height: data.height,
        units: { units: data.units || [] } as object,
        systemId: data.systemId || undefined,
        createdById: session.user.id,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Rack',
      entityId: rack.id,
      userId: session.user.id,
      changes: { after: { name: data.name, location: data.location, height: data.height, systemId: data.systemId } },
    })
    revalidatePath('/racks')
    if (data.systemId) {
      revalidatePath(`/systems/${data.systemId}`)
    }
    return { success: true, rack }
  } catch (error) {
    console.error('Failed to create rack:', error)
    return { error: 'Failed to create rack' }
  }
}

interface UpdateRackInput {
  name?: string
  location?: string | null
  height?: number
  systemId?: string | null
  units?: RackUnit[]
}

export async function updateRack(id: string, data: UpdateRackInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const before = await prisma.rack.findUnique({ where: { id } })
    const updateData: {
      name?: string
      location?: string | null
      height?: number
      systemId?: string | null
      units?: object
    } = {}

    if (data.name) updateData.name = data.name
    if (data.location !== undefined) updateData.location = data.location
    if (data.height) updateData.height = data.height
    if (data.systemId !== undefined) updateData.systemId = data.systemId
    if (data.units) updateData.units = { units: data.units } as object

    const rack = await prisma.rack.update({
      where: { id },
      data: updateData,
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'Rack',
      entityId: rack.id,
      userId: session.user.id,
      changes: { before: before ? { name: before.name, location: before.location } : undefined, after: { ...data } },
    })
    revalidatePath('/racks')
    revalidatePath(`/racks/${id}`)
    if (rack.systemId) {
      revalidatePath(`/systems/${rack.systemId}`)
    }
    return { success: true, rack }
  } catch (error) {
    console.error('Failed to update rack:', error)
    return { error: 'Failed to update rack' }
  }
}

export async function deleteRack(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const rack = await prisma.rack.findUnique({
      where: { id },
      select: { systemId: true, name: true },
    })
    await prisma.rack.delete({ where: { id } })
    await createAuditLog({
      action: 'DELETE',
      entityType: 'Rack',
      entityId: id,
      userId: session.user.id,
      changes: { before: rack ? { name: rack.name } : undefined },
    })
    revalidatePath('/racks')
    if (rack?.systemId) {
      revalidatePath(`/systems/${rack.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete rack:', error)
    return { error: 'Failed to delete rack' }
  }
}
