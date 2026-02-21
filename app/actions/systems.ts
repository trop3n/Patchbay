'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { systemSchema, type SystemInput } from '@/lib/validations/system'

export async function getSystems() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.system.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, username: true } },
      _count: { select: { diagrams: true, assets: true, devices: true } },
    },
  })
}

export async function getSystem(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.system.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, username: true, email: true } },
      diagrams: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
      assets: {
        orderBy: { name: 'asc' },
      },
      devices: {
        orderBy: { name: 'asc' },
      },
    },
  })
}

export async function createSystem(data: SystemInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = systemSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const system = await prisma.system.create({
      data: {
        ...validated.data,
        createdById: session.user.id,
      },
    })
    revalidatePath('/systems')
    return { success: true, system }
  } catch (error) {
    console.error('Failed to create system:', error)
    return { error: 'Failed to create system' }
  }
}

export async function updateSystem(id: string, data: Partial<SystemInput>) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = systemSchema.partial().safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const system = await prisma.system.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath('/systems')
    revalidatePath(`/systems/${id}`)
    return { success: true, system }
  } catch (error) {
    console.error('Failed to update system:', error)
    return { error: 'Failed to update system' }
  }
}

export async function deleteSystem(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    await prisma.system.delete({ where: { id } })
    revalidatePath('/systems')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete system:', error)
    return { error: 'Failed to delete system' }
  }
}
