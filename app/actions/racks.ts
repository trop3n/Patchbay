'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { rackSchema, rackUpdateSchema } from '@/lib/validations/rack'

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

export async function createRack(data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = rackSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const rack = await prisma.rack.create({
      data: {
        name: validated.data.name,
        location: validated.data.location,
        height: validated.data.height,
        units: { units: validated.data.units ?? [] } as object,
        systemId: validated.data.systemId ?? undefined,
        createdById: session.user.id,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Rack',
      entityId: rack.id,
      userId: session.user.id,
      changes: { after: { name: validated.data.name, location: validated.data.location, height: validated.data.height, systemId: validated.data.systemId } },
    })
    revalidatePath('/racks')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, rack }
  } catch (error) {
    console.error('Failed to create rack:', error)
    return { error: 'Failed to create rack' }
  }
}

export async function updateRack(id: string, data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = rackUpdateSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const before = await prisma.rack.findUnique({ where: { id } })
    const updateData: {
      name?: string
      location?: string | null
      height?: number
      systemId?: string | null
      units?: object
    } = {}

    if (validated.data.name !== undefined) updateData.name = validated.data.name
    if (validated.data.location !== undefined) updateData.location = validated.data.location
    if (validated.data.height !== undefined) updateData.height = validated.data.height
    if (validated.data.systemId !== undefined) updateData.systemId = validated.data.systemId
    if (validated.data.units !== undefined) updateData.units = { units: validated.data.units } as object

    const rack = await prisma.rack.update({
      where: { id },
      data: updateData,
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'Rack',
      entityId: rack.id,
      userId: session.user.id,
      changes: { before: before ? { name: before.name, location: before.location } : undefined, after: { ...validated.data } },
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
