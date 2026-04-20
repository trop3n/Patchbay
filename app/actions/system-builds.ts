'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { canWrite } from '@/lib/authorize'
import { systemBuildSchema, systemBuildUpdateSchema } from '@/lib/validations/system-build'

export async function getSystemBuilds(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.systemBuild.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { updatedAt: 'desc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getSystemBuild(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.systemBuild.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
    },
  })
}

export async function createSystemBuild(data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) return { error: 'Insufficient permissions' }

  const validated = systemBuildSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const build = await prisma.systemBuild.create({
      data: {
        title: validated.data.title,
        description: validated.data.description ?? undefined,
        data: (validated.data.data ?? { nodes: [], edges: [] }) as Prisma.InputJsonValue,
        systemId: validated.data.systemId ?? undefined,
        createdById: session.user.id,
      },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'SystemBuild',
      entityId: build.id,
      userId: session.user.id,
      changes: { after: { title: validated.data.title, systemId: validated.data.systemId } },
    })
    revalidatePath('/system-builder')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, build }
  } catch (error) {
    console.error('Failed to create system build:', error)
    return { error: 'Failed to create system build' }
  }
}

export async function updateSystemBuild(id: string, data: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) return { error: 'Insufficient permissions' }

  const validated = systemBuildUpdateSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') }
  }

  try {
    const before = await prisma.systemBuild.findUnique({ where: { id } })
    const updateData: Record<string, unknown> = {}

    if (validated.data.title !== undefined) updateData.title = validated.data.title
    if (validated.data.description !== undefined) updateData.description = validated.data.description
    if (validated.data.data !== undefined) updateData.data = validated.data.data as Prisma.InputJsonValue
    if (validated.data.systemId !== undefined) updateData.systemId = validated.data.systemId

    const build = await prisma.systemBuild.update({
      where: { id },
      data: updateData,
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'SystemBuild',
      entityId: build.id,
      userId: session.user.id,
      changes: { before: before ? { title: before.title } : undefined, after: { ...validated.data } },
    })
    revalidatePath('/system-builder')
    revalidatePath(`/system-builder/${id}`)
    if (build.systemId) {
      revalidatePath(`/systems/${build.systemId}`)
    }
    return { success: true, build }
  } catch (error) {
    console.error('Failed to update system build:', error)
    return { error: 'Failed to update system build' }
  }
}

export async function deleteSystemBuild(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const build = await prisma.systemBuild.findUnique({
      where: { id },
      select: { systemId: true, title: true },
    })
    await prisma.systemBuild.delete({ where: { id } })
    await createAuditLog({
      action: 'DELETE',
      entityType: 'SystemBuild',
      entityId: id,
      userId: session.user.id,
      changes: { before: build ? { title: build.title } : undefined },
    })
    revalidatePath('/system-builder')
    if (build?.systemId) {
      revalidatePath(`/systems/${build.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete system build:', error)
    return { error: 'Failed to delete system build' }
  }
}
