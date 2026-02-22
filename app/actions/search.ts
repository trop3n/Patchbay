'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface SearchResult {
  type: 'system' | 'document' | 'diagram' | 'asset'
  id: string
  title: string
  description?: string | null
  url: string
  meta?: string
}

export async function search(query: string): Promise<SearchResult[]> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.trim().toLowerCase()
  const results: SearchResult[] = []

  const [systems, documents, diagrams, assets] = await Promise.all([
    prisma.system.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, description: true, slug: true },
      take: 10,
    }),
    prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, system: { select: { name: true } } },
      take: 10,
    }),
    prisma.diagram.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, type: true, system: { select: { name: true } } },
      take: 10,
    }),
    prisma.asset.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { serialNumber: { contains: searchTerm, mode: 'insensitive' } },
          { model: { contains: searchTerm, mode: 'insensitive' } },
          { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, manufacturer: true, model: true, system: { select: { name: true } } },
      take: 10,
    }),
  ])

  for (const system of systems) {
    results.push({
      type: 'system',
      id: system.id,
      title: system.name,
      description: system.description,
      url: `/systems/${system.id}`,
      meta: 'System',
    })
  }

  for (const document of documents) {
    results.push({
      type: 'document',
      id: document.id,
      title: document.title,
      url: `/documents/${document.id}`,
      meta: document.system ? `Document • ${document.system.name}` : 'Document',
    })
  }

  for (const diagram of diagrams) {
    const typeLabels: Record<string, string> = {
      SIGNAL_FLOW: 'Signal Flow',
      WHITEBOARD: 'Whiteboard',
      NETWORK: 'Network',
      RACK_LAYOUT: 'Rack Layout',
    }
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

  return results
}
