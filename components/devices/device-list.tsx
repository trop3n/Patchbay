'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Device } from '@prisma/client'
import { deviceStatusColors, deviceStatusLabels } from '@/lib/device-status'
import { useDeviceStatus } from '@/components/providers/device-status-provider'
import { LiveStatusIndicator } from '@/components/devices/live-status-indicator'

type DeviceWithRelations = Device & {
  system: { id: string; name: string; slug: string } | null
}

interface DeviceListProps {
  devices: DeviceWithRelations[]
}

const statusColors = deviceStatusColors
const statusLabels = deviceStatusLabels

export function DeviceList({ devices }: DeviceListProps) {
  const { statusMap } = useDeviceStatus()

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <LiveStatusIndicator />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => {
          const liveStatus = statusMap.get(device.id) ?? device.status
          return (
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
                    <div className={`w-2 h-2 rounded-full ${statusColors[liveStatus]}`} />
                    {statusLabels[liveStatus]}
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
          )
        })}
      </div>
    </div>
  )
}
