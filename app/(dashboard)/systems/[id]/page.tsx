import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSystem } from '@/app/actions/systems'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, MapPin, Calendar, User, Plus } from 'lucide-react'
import { DeleteSystemButton } from '@/components/systems/delete-system-button'
import { SystemAttachments } from '@/components/attachments'
import type { DeviceStatus } from '@prisma/client'

const statusColors: Record<string, string> = {
  OPERATIONAL: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  OFFLINE: 'bg-red-500',
  MAINTENANCE: 'bg-blue-500',
  UNKNOWN: 'bg-gray-500',
}

const deviceStatusColors: Record<DeviceStatus, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-orange-500',
  UNKNOWN: 'bg-gray-500',
}

interface SystemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SystemDetailPage({ params }: SystemDetailPageProps) {
  const { id } = await params
  const system = await getSystem(id)

  if (!system) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/systems">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{system.name}</h1>
            <div className={`w-3 h-3 rounded-full ${statusColors[system.status]}`} />
          </div>
          {system.location && (
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {system.location}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/systems/${system.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteSystemButton systemId={system.id} systemName={system.name} />
        </div>
      </div>

      {system.category && (
        <Badge variant="secondary">{system.category}</Badge>
      )}

      {system.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{system.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Created By</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{system.createdBy.name || system.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Created</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(system.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Diagrams</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{system.diagrams.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assets</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{system.assets.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Devices</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{system.devices.length}</span>
          </CardContent>
        </Card>
      </div>

      {system.diagrams.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">Diagrams</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {system.diagrams.map((diagram) => (
                <Card key={diagram.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{diagram.title}</CardTitle>
                    <CardDescription>{diagram.type.replace('_', ' ')}</CardDescription>
                  </CardHeader>
                  {diagram.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {diagram.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {system.assets.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">Assets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {system.assets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    {asset.manufacturer && (
                      <CardDescription>{asset.manufacturer} {asset.model}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {asset.serialNumber && <span>S/N: {asset.serialNumber}</span>}
                      {asset.location && <span>{asset.location}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {(system.devices.length > 0 || true) && (
        <>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Devices</h2>
              <Button size="sm" asChild>
                <Link href={`/devices/new?systemId=${system.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Device
                </Link>
              </Button>
            </div>
            {system.devices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {system.devices.map((device) => (
                  <Card key={device.id}>
                    <CardHeader className="pb-2">
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
                        <div className={`w-3 h-3 rounded-full ${deviceStatusColors[device.status]}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {device.ipAddress && <span>IP: {device.ipAddress}</span>}
                        {device.manufacturer && device.model && (
                          <p>{device.manufacturer} {device.model}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No devices added yet</p>
                  <Button asChild>
                    <Link href={`/devices/new?systemId=${system.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Device
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      <Separator />
      <SystemAttachments
        systemId={system.id}
        initialAttachments={system.attachments}
        canDelete={true}
      />
    </div>
  )
}
