'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { assetSchema } from '@/lib/validations/asset'
import type { AssetStatus } from '@prisma/client'

export async function getAssets(systemId?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.asset.findMany({
    where: systemId ? { systemId } : undefined,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export interface AssetFilters {
  search?: string
  status?: AssetStatus
  systemId?: string
}

export async function getFilteredAssets(filters: AssetFilters) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const where: {
    OR?: Array<
      { name: { contains: string; mode: 'insensitive' } } |
      { serialNumber: { contains: string; mode: 'insensitive' } } |
      { model: { contains: string; mode: 'insensitive' } } |
      { manufacturer: { contains: string; mode: 'insensitive' } }
    >
    status?: AssetStatus
    systemId?: string
  } = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
      { manufacturer: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.systemId) {
    where.systemId = filters.systemId
  }

  return prisma.asset.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })
}

export async function getAssetFilterOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return { systems }
}

export async function getAsset(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return prisma.asset.findUnique({
    where: { id },
    include: {
      system: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true, username: true, email: true } },
    },
  })
}

interface CreateAssetInput {
  name: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  purchaseDate?: Date
  warrantyEnd?: Date
  location?: string
  status?: AssetStatus
  notes?: string
  systemId?: string
}

export async function createAsset(data: CreateAssetInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = assetSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const asset = await prisma.asset.create({
      data: {
        ...validated.data,
        purchaseDate: validated.data.purchaseDate ? new Date(validated.data.purchaseDate) : undefined,
        warrantyEnd: validated.data.warrantyEnd ? new Date(validated.data.warrantyEnd) : undefined,
        createdById: session.user.id,
      },
    })
    revalidatePath('/assets')
    if (validated.data.systemId) {
      revalidatePath(`/systems/${validated.data.systemId}`)
    }
    return { success: true, asset }
  } catch (error) {
    console.error('Failed to create asset:', error)
    return { error: 'Failed to create asset' }
  }
}

interface UpdateAssetInput {
  name?: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  purchaseDate?: Date | null
  warrantyEnd?: Date | null
  location?: string
  status?: AssetStatus
  notes?: string
  systemId?: string | null
}

export async function updateAsset(id: string, data: UpdateAssetInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const validated = assetSchema.partial().safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid input', issues: validated.error.issues }
  }

  try {
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(validated.data.name && { name: validated.data.name }),
        ...(validated.data.serialNumber !== undefined && { serialNumber: validated.data.serialNumber }),
        ...(validated.data.model !== undefined && { model: validated.data.model }),
        ...(validated.data.manufacturer !== undefined && { manufacturer: validated.data.manufacturer }),
        ...(validated.data.purchaseDate !== undefined && { 
          purchaseDate: validated.data.purchaseDate ? new Date(validated.data.purchaseDate) : null 
        }),
        ...(validated.data.warrantyEnd !== undefined && { 
          warrantyEnd: validated.data.warrantyEnd ? new Date(validated.data.warrantyEnd) : null 
        }),
        ...(validated.data.location !== undefined && { location: validated.data.location }),
        ...(validated.data.status && { status: validated.data.status }),
        ...(validated.data.notes !== undefined && { notes: validated.data.notes }),
        ...(validated.data.systemId !== undefined && { systemId: validated.data.systemId || null }),
      },
    })
    revalidatePath('/assets')
    revalidatePath(`/assets/${id}`)
    if (asset.systemId) {
      revalidatePath(`/systems/${asset.systemId}`)
    }
    return { success: true, asset }
  } catch (error) {
    console.error('Failed to update asset:', error)
    return { error: 'Failed to update asset' }
  }
}

export async function deleteAsset(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { systemId: true },
    })
    await prisma.asset.delete({ where: { id } })
    revalidatePath('/assets')
    if (asset?.systemId) {
      revalidatePath(`/systems/${asset.systemId}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return { error: 'Failed to delete asset' }
  }
}
