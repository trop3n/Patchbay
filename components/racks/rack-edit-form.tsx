'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RackBuilder } from '@/components/racks/rack-builder'
import { updateRack, type RackUnit } from '@/app/actions/racks'
import type { Rack, System, Asset } from '@prisma/client'

interface RackEditFormProps {
  rack: Rack
  systems: Pick<System, 'id' | 'name'>[]
  assets: Pick<Asset, 'id' | 'name' | 'manufacturer' | 'model'>[]
}

export function RackEditForm({ rack, systems, assets }: RackEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(rack.name)
  const [location, setLocation] = useState(rack.location || '')
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(rack.systemId || null)
  const [height, setHeight] = useState(rack.height)
  const [units, setUnits] = useState<RackUnit[]>([])

  useEffect(() => {
    const rackData = rack.units as { units?: RackUnit[] }
    if (rackData?.units) {
      setUnits(rackData.units)
    }
  }, [rack])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await updateRack(rack.id, {
      name: name.trim(),
      location: location.trim() || null,
      height,
      systemId: selectedSystemId,
      units,
    })

    if (result.success) {
      router.push(`/racks/${rack.id}`)
    } else {
      setError(result.error || 'Failed to update rack')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rack Details</CardTitle>
          <CardDescription>Update rack information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Equipment Rack"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Server Room A, Bay 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">Associated System</Label>
            <Select value={selectedSystemId || '__none__'} onValueChange={(v) => setSelectedSystemId(v === '__none__' ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <RackBuilder
        height={height}
        units={units}
        onHeightChange={setHeight}
        onUnitsChange={setUnits}
        assets={assets}
      />

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
  )
}
