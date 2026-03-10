'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LedWall } from '@prisma/client'

type LedWallWithRelations = Omit<LedWall, 'data'> & {
  data?: unknown
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface LedWallListProps {
  ledWalls: LedWallWithRelations[]
}

export function LedWallList({ ledWalls }: LedWallListProps) {
  if (ledWalls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No LED walls found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ledWalls.map((ledWall) => {
        const data = ledWall.data as { nodes?: unknown[] } | null
        const nodeCount = data?.nodes?.length ?? 0

        return (
          <Card key={ledWall.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/led-walls/${ledWall.id}`} className="hover:underline">
                  {ledWall.name}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={ledWall.type === 'VIDEO_WALL' ? 'default' : 'secondary'}>
                  {ledWall.type === 'VIDEO_WALL' ? 'Video Wall' : 'Strip Layout'}
                </Badge>
                {nodeCount > 0 && <span>{nodeCount} items</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {ledWall.description && (
                  <p className="line-clamp-2">{ledWall.description}</p>
                )}
                {ledWall.system && (
                  <p>
                    System:{' '}
                    <Link href={`/systems/${ledWall.system.slug}`} className="hover:underline">
                      {ledWall.system.name}
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
