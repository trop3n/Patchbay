'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Device, DeviceStatus } from '@prisma/client'

type DeviceWithRelations = Device & {
  system: { id: string; name: string; slug: string } | null
}

interface DeviceListProps {
  devices: DeviceWithRelations[]
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

export function DeviceList({ devices }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No devices found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <Card key={device.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/devices/${device.id}`} className="hover:underline">
                    {device.name}
                  </Link>
                </CardTitle>
                {device.deviceType && (
                  <CardDescription>{device.deviceType}</CardDescription>
                )}
              </div>
              <Badge variant="outline" className="gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColors[device.status]}`} />
                {statusLabels[device.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {device.ipAddress && (
                <p className="text-muted-foreground">
                  <span className="font-medium">IP:</span> {device.ipAddress}
                </p>
              )}
              {device.manufacturer && device.model && (
                <p className="text-muted-foreground">
                  <span className="font-medium">Model:</span> {device.manufacturer} {device.model}
                </p>
              )}
              {device.system && (
                <p className="text-muted-foreground">
                  <span className="font-medium">System:</span>{' '}
                  <Link href={`/systems/${device.system.id}`} className="hover:underline">
                    {device.system.name}
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
