'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SystemStatus } from '@/types'
import type { System } from '@prisma/client'

type SystemWithRelations = System & {
  createdBy: { name: string | null; username: string }
  _count: { diagrams: number; assets: number; devices: number }
}

interface SystemListProps {
  systems: SystemWithRelations[]
}

const statusColors: Record<SystemStatus, string> = {
  OPERATIONAL: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  OFFLINE: 'bg-red-500',
  MAINTENANCE: 'bg-blue-500',
  UNKNOWN: 'bg-gray-500',
}

export function SystemList({ systems }: SystemListProps) {
  if (systems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No systems found</p>
          <Button asChild>
            <Link href="/systems/new">Add your first system</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {systems.map((system) => (
        <Card key={system.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/systems/${system.id}`} className="hover:underline">
                    {system.name}
                  </Link>
                </CardTitle>
                {system.location && (
                  <CardDescription>{system.location}</CardDescription>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${statusColors[system.status]}`} />
            </div>
          </CardHeader>
          <CardContent>
            {system.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {system.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{system._count.diagrams} diagrams</span>
              <span>{system._count.assets} assets</span>
              <span>{system._count.devices} devices</span>
            </div>
            {system.category && (
              <Badge variant="secondary" className="mt-3">
                {system.category}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
