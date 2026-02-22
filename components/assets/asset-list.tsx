'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Asset } from '@prisma/client'

type AssetWithRelations = Asset & {
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface AssetListProps {
  assets: AssetWithRelations[]
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  IN_STORAGE: 'bg-blue-500',
  IN_REPAIR: 'bg-yellow-500',
  RETIRED: 'bg-gray-500',
  LOST: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  IN_STORAGE: 'In Storage',
  IN_REPAIR: 'In Repair',
  RETIRED: 'Retired',
  LOST: 'Lost',
}

export function AssetList({ assets }: AssetListProps) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No assets found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/assets/${asset.id}`} className="hover:underline">
                    {asset.name}
                  </Link>
                </CardTitle>
                {asset.manufacturer && asset.model && (
                  <CardDescription>{asset.manufacturer} {asset.model}</CardDescription>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${statusColors[asset.status]}`} title={statusLabels[asset.status]} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {asset.serialNumber && (
                <p className="text-muted-foreground">
                  <span className="font-medium">S/N:</span> {asset.serialNumber}
                </p>
              )}
              {asset.location && (
                <p className="text-muted-foreground">
                  <span className="font-medium">Location:</span> {asset.location}
                </p>
              )}
              {asset.system && (
                <p className="text-muted-foreground">
                  <span className="font-medium">System:</span>{' '}
                  <Link href={`/systems/${asset.system.slug}`} className="hover:underline">
                    {asset.system.name}
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
