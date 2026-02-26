'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Cpu, AlertTriangle, CheckCircle } from 'lucide-react'

interface DeviceHealthStats {
  total: number
  online: number
  offline: number
  warning: number
  error: number
  unknown: number
}

interface DashboardStatsCardsProps {
  totalSystems: number
  totalDevices: DeviceHealthStats
  systemsOperational: number
  systemsDegraded: number
  systemsOffline: number
}

export function DashboardStatsCards({
  totalSystems,
  totalDevices,
  systemsOperational,
}: DashboardStatsCardsProps) {
  const stats = [
    {
      title: 'Total Systems',
      value: totalSystems,
      icon: Monitor,
      description: `${systemsOperational} operational`,
      color: 'text-blue-500',
    },
    {
      title: 'Total Devices',
      value: totalDevices.total,
      icon: Cpu,
      description: `${totalDevices.online} online`,
      color: 'text-purple-500',
    },
    {
      title: 'Online',
      value: totalDevices.online,
      icon: CheckCircle,
      description: `${totalDevices.total > 0 ? Math.round((totalDevices.online / totalDevices.total) * 100) : 0}% of devices`,
      color: 'text-green-500',
    },
    {
      title: 'Issues',
      value: totalDevices.offline + totalDevices.error + totalDevices.warning,
      icon: AlertTriangle,
      description: `${totalDevices.offline} offline, ${totalDevices.error} errors, ${totalDevices.warning} warnings`,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
