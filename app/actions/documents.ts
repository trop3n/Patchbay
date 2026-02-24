'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { documentSchema, type DocumentInput } from '@/lib/validations/document'

export async function getDocuments(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.document.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getDocument(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.document.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
      attachments: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true, username: true } } },
      },
    },
  })
}

export async function createDocument(data: DocumentInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = documentSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const document = await prisma.document.create({
      data: {
        ...validated.data,
        createdById: session.user.id,
      },
    })
    revalidatePath('/documents')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, document }
  } catch (error) {
    console.error('Failed to create document:', error)
    return { error: 'Failed to create document' }
  }
}

export async function updateDocument(id: string, data: Partial<DocumentInput>) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = documentSchema.partial().safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const document = await prisma.document.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath('/documents')
    revalidatePath(`/documents/${id}`)
    if (document.systemId) {
      revalidatePath(`/systems/${document.systemId}`)
    }
    return { success: true, document }
  } catch (error) {
    console.error('Failed to update document:', error)
    return { error: 'Failed to update document' }
  }
}

export async function deleteDocument(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      select: { systemId: true },
    })
    await prisma.document.delete({ where: { id } })
    revalidatePath('/documents')
    if (document?.systemId) {
      revalidatePath(`/systems/${document.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete document:', error)
    return { error: 'Failed to delete document' }
  }
}
