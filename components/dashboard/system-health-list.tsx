'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin } from 'lucide-react'
import type { SystemStatus } from '@prisma/client'

interface DeviceHealthStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
  unknown: number
}

interface SystemHealth {
  id: string
  name: string
  slug: string
  status: SystemStatus
  location: string | null
  deviceCount: number
  deviceStats: DeviceHealthStats
}

interface SystemHealthListProps {
  systems: SystemHealth[]
}

const systemStatusColors: Record<SystemStatus, string> = {
  OPERATIONAL: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  OFFLINE: 'bg-red-500',
  MAINTENANCE: 'bg-blue-500',
  UNKNOWN: 'bg-gray-500',
}

const systemStatusLabels: Record<SystemStatus, string> = {
  OPERATIONAL: 'Operational',
  DEGRADED: 'Degraded',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
  UNKNOWN: 'Unknown',
}

function getHealthPercentage(stats: DeviceHealthStats): number {
  if (stats.total === 0) return 100
  return Math.round((stats.online / stats.total) * 100)
}

export function SystemHealthList({ systems }: SystemHealthListProps) {
  if (systems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No systems found</p>
          <Link href="/systems/new" className="text-primary hover:underline mt-2">
            Create your first system
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {systems.map((system) => {
        const healthPercent = getHealthPercentage(system.deviceStats)
        const hasIssues = system.deviceStats.offline > 0 || system.deviceStats.error > 0 || system.deviceStats.warning > 0

        return (
          <Link key={system.id} href={`/systems/${system.id}`}>
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    {system.location && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {system.location}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${systemStatusColors[system.status]}`} />
                    {systemStatusLabels[system.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {system.deviceCount} device{system.deviceCount !== 1 ? 's' : ''}
                    </span>
                    <span className={hasIssues ? 'text-orange-500' : 'text-green-500'}>
                      {system.deviceStats.online}/{system.deviceStats.total} online
                    </span>
                  </div>

                  {system.deviceCount > 0 && (
                    <div className="space-y-1">
                      <Progress
                        value={healthPercent}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{healthPercent}% healthy</span>
                        {hasIssues && (
                          <span className="text-orange-500">
                            {system.deviceStats.offline + system.deviceStats.error} issue{(system.deviceStats.offline + system.deviceStats.error) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {system.deviceCount === 0 && (
                    <p className="text-xs text-muted-foreground">No devices configured</p>
                  )}

                  {hasIssues && (
                    <div className="flex gap-2 text-xs">
                      {system.deviceStats.offline > 0 && (
                        <span className="text-red-500">{system.deviceStats.offline} offline</span>
                      )}
                      {system.deviceStats.error > 0 && (
                        <span className="text-orange-500">{system.deviceStats.error} error</span>
                      )}
                      {system.deviceStats.warning > 0 && (
                        <span className="text-yellow-500">{system.deviceStats.warning} warning</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
