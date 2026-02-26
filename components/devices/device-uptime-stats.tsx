'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DeviceStatus } from '@prisma/client'

interface DeviceUptimeStatsProps {
  stats: {
    currentStatus: DeviceStatus
    uptimePercentage: number
    totalChecks: number
    onlineCount: number
    offlineCount: number
    warningCount: number
    errorCount: number
    last24Hours: {
      online: number
      offline: number
      warning: number
      error: number
    }
    recentHistory: Array<{
      status: DeviceStatus
      previousStatus: DeviceStatus | null
      source: string | null
      recordedAt: Date
    }>
  } | null
}

const statusColors: Record<DeviceStatus, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-gray-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
  UNKNOWN: 'bg-gray-400',
}

const statusBadgeVariants: Record<DeviceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ONLINE: 'default',
  OFFLINE: 'secondary',
  WARNING: 'outline',
  ERROR: 'destructive',
  UNKNOWN: 'outline',
}

function formatUptime(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function DeviceUptimeStats({ stats }: DeviceUptimeStatsProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uptime Statistics</CardTitle>
          <CardDescription>No uptime data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const uptimeColor = stats.uptimePercentage >= 99
    ? 'text-green-600'
    : stats.uptimePercentage >= 95
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Uptime Statistics</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <Badge variant={statusBadgeVariants[stats.currentStatus]}>
              {stats.currentStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className={`text-2xl font-bold ${uptimeColor}`}>
                {formatUptime(stats.uptimePercentage)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Checks</p>
              <p className="text-2xl font-bold">{stats.totalChecks}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{stats.offlineCount}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Last 24 Hours</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">{stats.last24Hours.online}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">{stats.last24Hours.offline}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">{stats.last24Hours.warning}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">{stats.last24Hours.error}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.recentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Status Changes</CardTitle>
            <CardDescription>Last {stats.recentHistory.length} changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[record.status]}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {record.previousStatus && `${record.previousStatus} → `}
                        {record.status}
                      </p>
                      {record.source && (
                        <p className="text-xs text-muted-foreground">{record.source}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(record.recordedAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
