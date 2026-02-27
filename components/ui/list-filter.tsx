'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
import { Search, X } from 'lucide-react'

interface ListFilterProps {
  searchPlaceholder?: string
  statusOptions?: { value: string; label: string }[]
  categoryOptions?: string[]
  systemOptions?: { id: string; name: string }[]
  deviceTypeOptions?: string[]
}

export function ListFilter({
  searchPlaceholder = 'Search...',
  statusOptions,
  categoryOptions,
  systemOptions,
  deviceTypeOptions,
}: ListFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || undefined
  const currentCategory = searchParams.get('category') || undefined
  const currentSystemId = searchParams.get('systemId') || undefined
  const currentDeviceType = searchParams.get('deviceType') || undefined

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  function clearFilters() {
    router.push('', { scroll: false })
  }

  const hasFilters = currentSearch || currentStatus || currentCategory || currentSystemId || currentDeviceType

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <Label className="text-xs text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {statusOptions && (
        <div className="min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={currentStatus || 'all'} onValueChange={(v) => updateFilter('status', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {categoryOptions && categoryOptions.length > 0 && (
        <div className="min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={currentCategory || 'all'} onValueChange={(v) => updateFilter('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {systemOptions && systemOptions.length > 0 && (
        <div className="min-w-[180px]">
          <Label className="text-xs text-muted-foreground">System</Label>
          <Select value={currentSystemId || 'all'} onValueChange={(v) => updateFilter('systemId', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All systems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All systems</SelectItem>
              {systemOptions.map((sys) => (
                <SelectItem key={sys.id} value={sys.id}>
                  {sys.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {deviceTypeOptions && deviceTypeOptions.length > 0 && (
        <div className="min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Device Type</Label>
          <Select value={currentDeviceType || 'all'} onValueChange={(v) => updateFilter('deviceType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {deviceTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
