'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Diagram } from '@prisma/client'

type DiagramWithRelations = Diagram & {
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface DiagramListProps {
  diagrams: DiagramWithRelations[]
}

const typeLabels: Record<string, string> = {
  SIGNAL_FLOW: 'Signal Flow',
  WHITEBOARD: 'Whiteboard',
  NETWORK: 'Network',
  RACK_LAYOUT: 'Rack Layout',
}

export function DiagramList({ diagrams }: DiagramListProps) {
  if (diagrams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No diagrams found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {diagrams.map((diagram) => (
        <Card key={diagram.id} className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">
              <Link href={`/diagrams/${diagram.id}`} className="hover:underline">
                {diagram.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline">{typeLabels[diagram.type] || diagram.type}</Badge>
              {diagram.system && (
                <>
                  <span>•</span>
                  <Link href={`/systems/${diagram.system.slug}`} className="hover:underline">
                    {diagram.system.name}
                  </Link>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagram.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {diagram.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              By {diagram.createdBy.name || diagram.createdBy.username} •{' '}
              {new Date(diagram.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
