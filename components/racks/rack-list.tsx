'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Rack } from '@prisma/client'

type RackWithRelations = Rack & {
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface RackListProps {
  racks: RackWithRelations[]
}

export function RackList({ racks }: RackListProps) {
  if (racks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No racks found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {racks.map((rack) => {
        const units = (rack.units as { units?: { position: number; height: number }[] })?.units || []
        const equipmentCount = units.length
        const usedUnits = units.reduce((sum, u) => sum + u.height, 0)

        return (
          <Card key={rack.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/racks/${rack.id}`} className="hover:underline">
                  {rack.name}
                </Link>
              </CardTitle>
              <CardDescription>
                {rack.height}U Rack • {equipmentCount} items • {usedUnits}U used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {rack.location && (
                  <p>Location: {rack.location}</p>
                )}
                {rack.system && (
                  <p>
                    System:{' '}
                    <Link href={`/systems/${rack.system.slug}`} className="hover:underline">
                      {rack.system.name}
                    </Link>
                  </p>
                )}
              </div>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min((usedUnits / rack.height) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rack.height - usedUnits}U available
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
