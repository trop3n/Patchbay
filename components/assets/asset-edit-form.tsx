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
import { updateAsset } from '@/app/actions/assets'
import type { Asset, System } from '@prisma/client'
import type { AssetStatus } from '@prisma/client'

interface AssetEditFormProps {
  asset: Asset
  systems: Pick<System, 'id' | 'name'>[]
}

const statusOptions: { value: AssetStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_STORAGE', label: 'In Storage' },
  { value: 'IN_REPAIR', label: 'In Repair' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LOST', label: 'Lost' },
]

export function AssetEditForm({ asset, systems }: AssetEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(asset.systemId || null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await updateAsset(asset.id, {
      name: formData.get('name') as string,
      serialNumber: formData.get('serialNumber') as string || undefined,
      model: formData.get('model') as string || undefined,
      manufacturer: formData.get('manufacturer') as string || undefined,
      purchaseDate: formData.get('purchaseDate') ? new Date(formData.get('purchaseDate') as string) : null,
      warrantyEnd: formData.get('warrantyEnd') ? new Date(formData.get('warrantyEnd') as string) : null,
      location: formData.get('location') as string || undefined,
      status: formData.get('status') as AssetStatus,
      notes: formData.get('notes') as string || undefined,
      systemId: selectedSystemId,
    })

    if (result.success) {
      router.push(`/assets/${asset.id}`)
    } else {
      setError(result.error || 'Failed to update asset')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Asset</CardTitle>
        <CardDescription>Update asset information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Crestron CP4N"
              defaultValue={asset.name}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                placeholder="Crestron"
                defaultValue={asset.manufacturer || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                placeholder="CP4N"
                defaultValue={asset.model || ''}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                placeholder="SN12345678"
                defaultValue={asset.serialNumber || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Rack A1, Shelf 3"
                defaultValue={asset.location || ''}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyEnd">Warranty End</Label>
              <Input
                id="warrantyEnd"
                name="warrantyEnd"
                type="date"
                defaultValue={asset.warrantyEnd ? new Date(asset.warrantyEnd).toISOString().split('T')[0] : ''}
              />
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
            <Select name="status" defaultValue={asset.status}>
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
              defaultValue={asset.notes || ''}
            />
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
