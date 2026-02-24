'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { saveFile, deleteFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/storage'

export async function getAttachments(params: { systemId?: string; documentId?: string }) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const where: { systemId?: string; documentId?: string } = {}
  if (params.systemId) where.systemId = params.systemId
  if (params.documentId) where.documentId = params.documentId

  return prisma.attachment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getAttachment(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.attachment.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function uploadAttachment(
  formData: FormData
): Promise<{ success: true; attachment: unknown } | { error: string }> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const systemId = formData.get('systemId') as string | null
  const documentId = formData.get('documentId') as string | null

  if (!file) {
    return { error: 'No file provided' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: 'File type not allowed' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File size exceeds 50MB limit' }
  }

  try {
    const { path, filename } = await saveFile(file)

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path,
        systemId: systemId || null,
        documentId: documentId || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { name: true, username: true } },
      },
    })

    if (systemId) {
      revalidatePath(`/systems/${systemId}`)
    }
    if (documentId) {
      revalidatePath(`/documents/${documentId}`)
    }

    return { success: true, attachment }
  } catch (error) {
    console.error('Failed to upload attachment:', error)
    return { error: 'Failed to upload attachment' }
  }
}

export async function deleteAttachment(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      select: { path: true, systemId: true, documentId: true },
    })

    if (!attachment) {
      return { error: 'Attachment not found' }
    }

    await deleteFile(attachment.path)
    await prisma.attachment.delete({ where: { id } })

    if (attachment.systemId) {
      revalidatePath(`/systems/${attachment.systemId}`)
    }
    if (attachment.documentId) {
      revalidatePath(`/documents/${attachment.documentId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete attachment:', error)
    return { error: 'Failed to delete attachment' }
  }
}
