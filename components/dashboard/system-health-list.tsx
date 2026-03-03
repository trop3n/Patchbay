'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin } from 'lucide-react'
import type { DeviceStatus, SystemStatus } from '@prisma/client'
import { useDeviceStatus } from '@/components/providers/device-status-provider'

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
  devices: Array<{ id: string; status: DeviceStatus }>
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

function computeLiveStats(
  devices: Array<{ id: string; status: DeviceStatus }>,
  statusMap: Map<string, DeviceStatus>
): DeviceHealthStats {
  const statuses = devices.map((d) => statusMap.get(d.id) ?? d.status)
  return {
    total: statuses.length,
    online: statuses.filter((s) => s === 'ONLINE').length,
    offline: statuses.filter((s) => s === 'OFFLINE').length,
    warning: statuses.filter((s) => s === 'WARNING').length,
    error: statuses.filter((s) => s === 'ERROR').length,
    unknown: statuses.filter((s) => s === 'UNKNOWN').length,
  }
}

export function SystemHealthList({ systems }: SystemHealthListProps) {
  const { statusMap } = useDeviceStatus()

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
        const liveStats = computeLiveStats(system.devices, statusMap)
        const healthPercent = getHealthPercentage(liveStats)
        const hasIssues = liveStats.offline > 0 || liveStats.error > 0 || liveStats.warning > 0

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
                      {liveStats.online}/{liveStats.total} online
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
                            {liveStats.offline + liveStats.error} issue{(liveStats.offline + liveStats.error) !== 1 ? 's' : ''}
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
                      {liveStats.offline > 0 && (
                        <span className="text-red-500">{liveStats.offline} offline</span>
                      )}
                      {liveStats.error > 0 && (
                        <span className="text-orange-500">{liveStats.error} error</span>
                      )}
                      {liveStats.warning > 0 && (
                        <span className="text-yellow-500">{liveStats.warning} warning</span>
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
