'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export interface SearchFilters {
  types?: ('system' | 'document' | 'diagram' | 'asset' | 'rack')[]
  status?: string[]
  category?: string
  systemId?: string
}

interface SearchResult {
  type: 'system' | 'document' | 'diagram' | 'asset' | 'rack'
  id: string
  title: string
  description?: string | null
  url: string
  meta?: string
}

export async function search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.trim().toLowerCase()
  const results: SearchResult[] = []
  const types = filters?.types || ['system', 'document', 'diagram', 'asset', 'rack']

  const searchPromises: Promise<void>[] = []

  if (types.includes('system')) {
    searchPromises.push(
      prisma.system.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            filters?.status ? { status: { in: filters.status as never[] } } : {},
            filters?.category ? { category: filters.category } : {},
          ],
        },
        select: { id: true, name: true, description: true, slug: true, status: true },
        take: 10,
      }).then((systems) => {
        for (const system of systems) {
          results.push({
            type: 'system',
            id: system.id,
            title: system.name,
            description: system.description,
            url: `/systems/${system.id}`,
            meta: `System • ${system.status.replace('_', ' ')}`,
          })
        }
      })
    )
  }

  if (types.includes('document')) {
    searchPromises.push(
      prisma.document.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { content: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            filters?.systemId ? { systemId: filters.systemId } : {},
          ],
        },
        select: { id: true, title: true, system: { select: { name: true } } },
        take: 10,
      }).then((documents) => {
        for (const document of documents) {
          results.push({
            type: 'document',
            id: document.id,
            title: document.title,
            url: `/documents/${document.id}`,
            meta: document.system ? `Document • ${document.system.name}` : 'Document',
          })
        }
      })
    )
  }

  if (types.includes('diagram')) {
    searchPromises.push(
      prisma.diagram.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            filters?.systemId ? { systemId: filters.systemId } : {},
          ],
        },
        select: { id: true, title: true, type: true, system: { select: { name: true } } },
        take: 10,
      }).then((diagrams) => {
        const typeLabels: Record<string, string> = {
          SIGNAL_FLOW: 'Signal Flow',
          WHITEBOARD: 'Whiteboard',
          NETWORK: 'Network',
          RACK_LAYOUT: 'Rack Layout',
        }
        for (const diagram of diagrams) {
          results.push({
            type: 'diagram',
            id: diagram.id,
            title: diagram.title,
            url: `/diagrams/${diagram.id}`,
            meta: diagram.system
              ? `${typeLabels[diagram.type] || diagram.type} • ${diagram.system.name}`
              : typeLabels[diagram.type] || diagram.type,
          })
        }
      })
    )
  }

  if (types.includes('asset')) {
    searchPromises.push(
      prisma.asset.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
                { model: { contains: searchTerm, mode: 'insensitive' } },
                { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            filters?.status ? { status: { in: filters.status as never[] } } : {},
            filters?.systemId ? { systemId: filters.systemId } : {},
          ],
        },
        select: { id: true, name: true, manufacturer: true, model: true, system: { select: { name: true } } },
        take: 10,
      }).then((assets) => {
        for (const asset of assets) {
          results.push({
            type: 'asset',
            id: asset.id,
            title: asset.name,
            description: asset.manufacturer && asset.model
              ? `${asset.manufacturer} ${asset.model}`
              : undefined,
            url: `/assets/${asset.id}`,
            meta: asset.system ? `Asset • ${asset.system.name}` : 'Asset',
          })
        }
      })
    )
  }

  if (types.includes('rack')) {
    searchPromises.push(
      prisma.rack.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            filters?.systemId ? { systemId: filters.systemId } : {},
          ],
        },
        select: { id: true, name: true, height: true, system: { select: { name: true } } },
        take: 10,
      }).then((racks) => {
        for (const rack of racks) {
          results.push({
            type: 'rack',
            id: rack.id,
            title: rack.name,
            description: `${rack.height}U Rack`,
            url: `/racks/${rack.id}`,
            meta: rack.system ? `Rack • ${rack.system.name}` : 'Rack',
          })
        }
      })
    )
  }

  await Promise.all(searchPromises)

  return results
}

export async function getSearchOptions() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const [systems, categories] = await Promise.all([
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.system.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    }),
  ])

  return {
    systems,
    categories: categories.map((s) => s.category).filter(Boolean) as string[],
  }
}
