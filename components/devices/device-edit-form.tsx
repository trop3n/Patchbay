'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateDevice } from '@/app/actions/devices'
import { deviceTypeOptions } from '@/lib/validations/device'
import type { Device, System } from '@prisma/client'
import type { DeviceStatus, SnmpVersion } from '@prisma/client'

interface DeviceEditFormProps {
  device: Device
  systems: Pick<System, 'id' | 'name'>[]
}

const statusOptions: { value: DeviceStatus; label: string }[] = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

const snmpVersionOptions: { value: SnmpVersion; label: string }[] = [
  { value: 'V1', label: 'SNMPv1' },
  { value: 'V2C', label: 'SNMPv2c' },
  { value: 'V3', label: 'SNMPv3' },
]

export function DeviceEditForm({ device, systems }: DeviceEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string>(device.systemId)
  const [snmpEnabled, setSnmpEnabled] = useState(device.snmpEnabled)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await updateDevice(device.id, {
      name: formData.get('name') as string,
      ipAddress: formData.get('ipAddress') as string || null,
      macAddress: formData.get('macAddress') as string || null,
      deviceType: formData.get('deviceType') as string || null,
      manufacturer: formData.get('manufacturer') as string || null,
      model: formData.get('model') as string || null,
      status: formData.get('status') as DeviceStatus,
      systemId: selectedSystemId,
      snmpEnabled,
      snmpVersion: (formData.get('snmpVersion') as SnmpVersion) || null,
      snmpCommunity: formData.get('snmpCommunity') as string || null,
      snmpPort: parseInt(formData.get('snmpPort') as string, 10) || 161,
    })

    if (result.success) {
      router.push(`/devices/${device.id}`)
    } else {
      setError(result.error || 'Failed to update device')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Device</CardTitle>
        <CardDescription>Update device information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Main Switcher"
              defaultValue={device.name}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                placeholder="192.168.1.100"
                defaultValue={device.ipAddress || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                name="macAddress"
                placeholder="00:1A:2B:3C:4D:5E"
                defaultValue={device.macAddress || ''}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                placeholder="Crestron"
                defaultValue={device.manufacturer || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                placeholder="NVX-360"
                defaultValue={device.model || ''}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select name="deviceType" defaultValue={device.deviceType || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={device.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">System *</Label>
            <Select
              value={selectedSystemId}
              onValueChange={setSelectedSystemId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a system" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="snmpEnabled"
                checked={snmpEnabled}
                onCheckedChange={(checked) => setSnmpEnabled(checked === true)}
              />
              <Label htmlFor="snmpEnabled" className="font-normal cursor-pointer">
                Enable SNMP Monitoring
              </Label>
            </div>

            {snmpEnabled && (
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="snmpVersion">SNMP Version</Label>
                    <Select name="snmpVersion" defaultValue={device.snmpVersion || 'V2C'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {snmpVersionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snmpCommunity">Community String</Label>
                    <Input
                      id="snmpCommunity"
                      name="snmpCommunity"
                      placeholder="public"
                      defaultValue={device.snmpCommunity || 'public'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snmpPort">Port</Label>
                    <Input
                      id="snmpPort"
                      name="snmpPort"
                      type="number"
                      placeholder="161"
                      defaultValue={device.snmpPort || 161}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
