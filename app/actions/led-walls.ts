'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { canWrite } from '@/lib/authorize'
import { ledWallSchema, ledWallUpdateSchema } from '@/lib/validations/led-wall'

export async function getLedWalls(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.ledWall.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getLedWall(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.ledWall.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
    },
  })
}

export async function createLedWall(data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) return { error: 'Insufficient permissions' }

  const validated = ledWallSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const ledWall = await prisma.ledWall.create({
      data: {
        name: validated.data.name,
        description: validated.data.description ?? undefined,
        type: validated.data.type,
        data: validated.data.data ?? {},
        width: validated.data.width ?? undefined,
        height: validated.data.height ?? undefined,
        systemId: validated.data.systemId ?? undefined,
        createdById: session.user.id,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'LedWall',
      entityId: ledWall.id,
      userId: session.user.id,
      changes: { after: { name: validated.data.name, type: validated.data.type, systemId: validated.data.systemId } },
    })
    revalidatePath('/led-walls')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, ledWall }
  } catch (error) {
    console.error('Failed to create LED wall:', error)
    return { error: 'Failed to create LED wall' }
  }
}

export async function updateLedWall(id: string, data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) return { error: 'Insufficient permissions' }

  const validated = ledWallUpdateSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const before = await prisma.ledWall.findUnique({ where: { id } })
    const updateData: Record<string, unknown> = {}

    if (validated.data.name !== undefined) updateData.name = validated.data.name
    if (validated.data.description !== undefined) updateData.description = validated.data.description
    if (validated.data.type !== undefined) updateData.type = validated.data.type
    if (validated.data.data !== undefined) updateData.data = validated.data.data
    if (validated.data.width !== undefined) updateData.width = validated.data.width
    if (validated.data.height !== undefined) updateData.height = validated.data.height
    if (validated.data.systemId !== undefined) updateData.systemId = validated.data.systemId

    const ledWall = await prisma.ledWall.update({
      where: { id },
      data: updateData,
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'LedWall',
      entityId: ledWall.id,
      userId: session.user.id,
      changes: { before: before ? { name: before.name, type: before.type } : undefined, after: { ...validated.data } },
    })
    revalidatePath('/led-walls')
    revalidatePath(`/led-walls/${id}`)
    if (ledWall.systemId) {
      revalidatePath(`/systems/${ledWall.systemId}`)
    }
    return { success: true, ledWall }
  } catch (error) {
    console.error('Failed to update LED wall:', error)
    return { error: 'Failed to update LED wall' }
  }
}

export async function deleteLedWall(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const ledWall = await prisma.ledWall.findUnique({
      where: { id },
      select: { systemId: true, name: true },
    })
    await prisma.ledWall.delete({ where: { id } })
    await createAuditLog({
      action: 'DELETE',
      entityType: 'LedWall',
      entityId: id,
      userId: session.user.id,
      changes: { before: ledWall ? { name: ledWall.name } : undefined },
    })
    revalidatePath('/led-walls')
    if (ledWall?.systemId) {
      revalidatePath(`/systems/${ledWall.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete LED wall:', error)
    return { error: 'Failed to delete LED wall' }
  }
}
