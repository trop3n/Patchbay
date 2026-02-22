'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { diagramSchema } from '@/lib/validations/diagram'
import type { DiagramType } from '@prisma/client'

export async function getDiagrams(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.diagram.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getDiagram(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.diagram.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
    },
  })
}

interface CreateDiagramInput {
  title: string
  description?: string
  type: DiagramType
  systemId?: string
  data: unknown
}

export async function createDiagram(input: CreateDiagramInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = diagramSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const diagram = await prisma.diagram.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        type: validated.data.type as DiagramType,
        data: validated.data.data as object,
        systemId: validated.data.systemId || undefined,
        createdById: session.user.id,
      },
    })
    revalidatePath('/diagrams')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, diagram }
  } catch (error) {
    console.error('Failed to create diagram:', error)
    return { error: 'Failed to create diagram' }
  }
}

interface UpdateDiagramInput {
  title?: string
  description?: string
  type?: DiagramType
  systemId?: string | null
  data?: unknown
}

export async function updateDiagram(id: string, input: UpdateDiagramInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = diagramSchema.partial().safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const diagram = await prisma.diagram.update({
      where: { id },
      data: {
        ...(validated.data.title && { title: validated.data.title }),
        ...(validated.data.description !== undefined && { description: validated.data.description }),
        ...(validated.data.type && { type: validated.data.type as DiagramType }),
        ...(validated.data.systemId !== undefined && { systemId: validated.data.systemId || null }),
        ...(validated.data.data !== undefined && { data: validated.data.data as object }),
      },
    })
    revalidatePath('/diagrams')
    revalidatePath(`/diagrams/${id}`)
    if (diagram.systemId) {
      revalidatePath(`/systems/${diagram.systemId}`)
    }
    return { success: true, diagram }
  } catch (error) {
    console.error('Failed to update diagram:', error)
    return { error: 'Failed to update diagram' }
  }
}

export async function deleteDiagram(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const diagram = await prisma.diagram.findUnique({
      where: { id },
      select: { systemId: true },
    })
    await prisma.diagram.delete({ where: { id } })
    revalidatePath('/diagrams')
    if (diagram?.systemId) {
      revalidatePath(`/systems/${diagram.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete diagram:', error)
    return { error: 'Failed to delete diagram' }
  }
}
