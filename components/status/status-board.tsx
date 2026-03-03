'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDeviceStatus } from '@/components/providers/device-status-provider'
import { deviceStatusLabels, deviceStatusBadgeVariants } from '@/lib/device-status'
import type { getDashboardStats, getRecentAlerts } from '@/app/actions/dashboard'

interface StatusBoardProps {
  stats: Awaited<ReturnType<typeof getDashboardStats>>
  alerts: Awaited<ReturnType<typeof getRecentAlerts>>
}

export function StatusBoard({ stats, alerts }: StatusBoardProps) {
  const { statusMap, connected } = useDeviceStatus()

  const liveOnline =
    statusMap.size > 0
      ? Array.from(statusMap.values()).filter((s) => s === 'ONLINE').length
      : stats.totalDevices.online

  return (
    <div className="max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <Link href="/" className="font-bold text-lg">
          Patchbay
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`rounded-full w-2 h-2 ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-muted-foreground">
            {connected ? 'Live' : 'Reconnecting…'}
          </span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Systems OK</span>
          <span className="font-bold">
            {stats.systemsOperational} / {stats.totalSystems}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Devices online</span>
          <span className="font-bold">
            {liveOnline} / {stats.totalDevices.total}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Active alerts</span>
          <span className="font-bold">{alerts.length}</span>
        </div>
      </div>

      <Separator />

      {/* Systems list */}
      <div className="px-4 py-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Systems
        </p>
        <div className="space-y-2">
          {stats.systemsHealth.map((system) => {
            const deviceStatuses = system.devices.map((d) =>
              statusMap.has(d.id) ? statusMap.get(d.id)! : d.status
            )
            const hasError = deviceStatuses.some(
              (s) => s === 'OFFLINE' || s === 'ERROR'
            )
            const hasWarning = deviceStatuses.some((s) => s === 'WARNING')

            const dotColor = hasError
              ? 'bg-red-500'
              : hasWarning
              ? 'bg-yellow-500'
              : 'bg-green-500'

            return (
              <div key={system.id} className="flex justify-between items-center">
                <span className="font-medium truncate mr-2">{system.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full w-2 h-2 ${dotColor}`} />
                  <Badge variant="outline" className="text-xs">
                    {system.status}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Alerts list */}
      <div className="px-4 py-4 pb-6">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Active Alerts
        </p>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex justify-between items-start">
                <div className="min-w-0 mr-2">
                  <p className="font-medium truncate">{alert.name}</p>
                  {alert.systemName && (
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.systemName}
                    </p>
                  )}
                </div>
                <Badge
                  variant={deviceStatusBadgeVariants[alert.status]}
                  className="shrink-0 text-xs"
                >
                  {deviceStatusLabels[alert.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
