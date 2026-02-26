'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'
import type { DeviceStatus } from '@prisma/client'

interface RecentAlert {
  id: string
  name: string
  status: DeviceStatus
  deviceType: string | null
  systemId: string | undefined
  systemName: string | undefined
  lastSeenAt: Date | null
}

interface RecentAlertsProps {
  alerts: RecentAlert[]
}

const statusColors: Record<DeviceStatus, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-orange-500',
  UNKNOWN: 'bg-gray-500',
}

const statusLabels: Record<DeviceStatus, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  WARNING: 'Warning',
  ERROR: 'Error',
  UNKNOWN: 'Unknown',
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts
          </CardTitle>
          <CardDescription>Devices requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No active alerts. All devices are healthy.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Active Alerts
        </CardTitle>
        <CardDescription>{alerts.length} device{alerts.length !== 1 ? 's' : ''} requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/devices/${alert.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${statusColors[alert.status]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{alert.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[alert.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {alert.deviceType && <span>{alert.deviceType}</span>}
                  {alert.systemName && (
                    <>
                      <span>•</span>
                      <span>{alert.systemName}</span>
                    </>
                  )}
                </div>
                {alert.lastSeenAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Last seen {formatDistanceToNow(new Date(alert.lastSeenAt))}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
