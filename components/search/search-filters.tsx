'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSearchOptions, type SearchFilters } from '@/app/actions/search'
import { Filter, X } from 'lucide-react'

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFilters) => void
}

const typeOptions = [
  { value: 'system', label: 'Systems' },
  { value: 'document', label: 'Documents' },
  { value: 'diagram', label: 'Diagrams' },
  { value: 'asset', label: 'Assets' },
  { value: 'rack', label: 'Racks' },
]

const systemStatusOptions = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'DEGRADED', label: 'Degraded' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

export function SearchFiltersPanel({ onFiltersChange }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [systems, setSystems] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSystemId, setSelectedSystemId] = useState<string>('')

  useEffect(() => {
    getSearchOptions().then((options) => {
      setSystems(options.systems)
      setCategories(options.categories)
    })

    const types = searchParams.get('types')?.split(',').filter(Boolean) || []
    const status = searchParams.get('status')?.split(',').filter(Boolean) || []
    const category = searchParams.get('category') || ''
    const systemId = searchParams.get('systemId') || ''

    setSelectedTypes(types)
    setSelectedStatus(status)
    setSelectedCategory(category)
    setSelectedSystemId(systemId)
  }, [searchParams])

  function toggleType(type: string) {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(newTypes)
  }

  function toggleStatus(status: string) {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status]
    setSelectedStatus(newStatus)
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedTypes.length > 0) {
      params.set('types', selectedTypes.join(','))
    } else {
      params.delete('types')
    }
    
    if (selectedStatus.length > 0) {
      params.set('status', selectedStatus.join(','))
    } else {
      params.delete('status')
    }
    
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }
    
    if (selectedSystemId) {
      params.set('systemId', selectedSystemId)
    } else {
      params.delete('systemId')
    }

    router.push(`/search?${params.toString()}`)
    
    onFiltersChange?.({
      types: selectedTypes as SearchFilters['types'],
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      category: selectedCategory || undefined,
      systemId: selectedSystemId || undefined,
    })
    
    setIsOpen(false)
  }

  function clearFilters() {
    setSelectedTypes([])
    setSelectedStatus([])
    setSelectedCategory('')
    setSelectedSystemId('')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('types')
    params.delete('status')
    params.delete('category')
    params.delete('systemId')
    
    router.push(`/search?${params.toString()}`)
    
    onFiltersChange?.({})
    setIsOpen(false)
  }

  const activeFilterCount = 
    selectedTypes.length + 
    selectedStatus.length + 
    (selectedCategory ? 1 : 0) + 
    (selectedSystemId ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={selectedTypes.includes(option.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleType(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status (Systems & Assets)</Label>
              <div className="flex flex-wrap gap-2">
                {systemStatusOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={selectedStatus.includes(option.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Related to System</Label>
              <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
                <SelectTrigger>
                  <SelectValue placeholder="All systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All systems</SelectItem>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
