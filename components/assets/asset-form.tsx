'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAsset } from '@/app/actions/assets'
import type { System } from '@prisma/client'
import type { AssetStatus } from '@prisma/client'

interface AssetFormProps {
  systems: Pick<System, 'id' | 'name'>[]
  systemId?: string
}

const statusOptions: { value: AssetStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_STORAGE', label: 'In Storage' },
  { value: 'IN_REPAIR', label: 'In Repair' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LOST', label: 'Lost' },
]

export function AssetForm({ systems, systemId }: AssetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(systemId || null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await createAsset({
      name: formData.get('name') as string,
      serialNumber: formData.get('serialNumber') as string || undefined,
      model: formData.get('model') as string || undefined,
      manufacturer: formData.get('manufacturer') as string || undefined,
      purchaseDate: formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : undefined,
      warrantyEnd: formData.get('warrantyEnd') ? new Date(formData.get('warrantyEnd') as string) : undefined,
      location: formData.get('location') as string || undefined,
      status: formData.get('status') as AssetStatus || 'ACTIVE',
      notes: formData.get('notes') as string || undefined,
      systemId: selectedSystemId || undefined,
    })

    if (result.success && result.asset) {
      router.push(`/assets/${result.asset.id}`)
    } else {
      setError(result.error || 'Failed to create asset')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Asset</CardTitle>
        <CardDescription>Add equipment to your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required placeholder="Crestron CP4N" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" name="manufacturer" placeholder="Crestron" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="CP4N" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" placeholder="SN12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Rack A1, Shelf 3" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" name="purchaseDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyEnd">Warranty End</Label>
              <Input id="warrantyEnd" name="warrantyEnd" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">Associated System</Label>
            <Select
              value={selectedSystemId || '__none__'}
              onValueChange={(v) => setSelectedSystemId(v === '__none__' ? null : v)}
            >
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="ACTIVE">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about this asset..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Asset'}
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
