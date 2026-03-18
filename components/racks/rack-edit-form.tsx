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
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [configOpen, setConfigOpen] = useState(true)

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
    <form onSubmit={onSubmit} className="flex h-full gap-0">
      <div className={`shrink-0 flex transition-all duration-200 ${configOpen ? 'w-80' : 'w-0'}`}>
        <Card className={`overflow-hidden border-r rounded-r-none flex flex-col transition-all duration-200 ${configOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-0'}`}>
          <CardHeader>
            <CardTitle>Edit Rack</CardTitle>
            <CardDescription>Update rack details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1">
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
          </CardContent>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setConfigOpen((prev) => !prev)}
        className="shrink-0 w-6 flex items-center justify-center border-y border-r rounded-r-md bg-muted/50 hover:bg-muted transition-colors"
        title={configOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {configOpen ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <RackBuilder
          height={height}
          units={units}
          onHeightChange={setHeight}
          onUnitsChange={setUnits}
          assets={assets}
        />
      </div>
    </form>
  )
}
