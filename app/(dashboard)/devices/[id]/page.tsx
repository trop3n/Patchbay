import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDevice } from '@/app/actions/devices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Network, Calendar, Package, Cpu, Clock } from 'lucide-react'
import { DeleteDeviceButton } from '@/components/devices/delete-device-button'
import { DeviceStatusUpdate } from '@/components/devices/device-status-update'
import type { DeviceStatus } from '@prisma/client'

interface DeviceDetailPageProps {
  params: Promise<{ id: string }>
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

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  const { id } = await params
  const device = await getDevice(id)

  if (!device) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/devices">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{device.name}</h1>
            <div className={`w-3 h-3 rounded-full ${statusColors[device.status]}`} title={statusLabels[device.status]} />
          </div>
          {device.deviceType && (
            <p className="text-muted-foreground">{device.deviceType}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/devices/${device.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteDeviceButton deviceId={device.id} deviceName={device.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {device.ipAddress && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">IP Address</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Network className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{device.ipAddress}</span>
            </CardContent>
          </Card>
        )}
        {device.macAddress && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MAC Address</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Network className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{device.macAddress}</span>
            </CardContent>
          </Card>
        )}
        {device.system && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <Link href={`/systems/${device.system.id}`} className="hover:underline">
                {device.system.name}
              </Link>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceStatusUpdate deviceId={device.id} currentStatus={device.status} />
          </CardContent>
        </Card>
        {device.manufacturer && device.model && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Model</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span>{device.manufacturer} {device.model}</span>
            </CardContent>
          </Card>
        )}
        {device.lastSeenAt && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Seen</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(device.lastSeenAt).toLocaleString()}</span>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(device.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      {device.logs && device.logs.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {device.logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className={`font-medium ${
                      log.level === 'ERROR' || log.level === 'CRITICAL' ? 'text-red-500' :
                      log.level === 'WARNING' ? 'text-yellow-500' :
                      log.level === 'INFO' ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
