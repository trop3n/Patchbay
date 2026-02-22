'use client'

import { useState } from 'react'
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
import { createRack, type RackUnit } from '@/app/actions/racks'
import type { System, Asset } from '@prisma/client'

interface RackFormProps {
  systems: Pick<System, 'id' | 'name'>[]
  assets: Pick<Asset, 'id' | 'name' | 'manufacturer' | 'model'>[]
}

export function RackForm({ systems, assets }: RackFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)
  const [height, setHeight] = useState(42)
  const [units, setUnits] = useState<RackUnit[]>([])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await createRack({
      name: name.trim(),
      location: location.trim() || undefined,
      height,
      systemId: selectedSystemId || undefined,
      units,
    })

    if (result.success && result.rack) {
      router.push(`/racks/${result.rack.id}`)
    } else {
      setError(result.error || 'Failed to create rack')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rack Details</CardTitle>
          <CardDescription>Configure rack information</CardDescription>
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
            <Select value={selectedSystemId || ''} onValueChange={(v) => setSelectedSystemId(v || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
          {isLoading ? 'Creating...' : 'Create Rack'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
