'use client'

import { ListFilter } from '@/components/ui/list-filter'

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_STORAGE', label: 'In Storage' },
  { value: 'IN_REPAIR', label: 'In Repair' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LOST', label: 'Lost' },
]

interface AssetListFilterProps {
  systems?: { id: string; name: string }[]
}

export function AssetListFilter({ systems }: AssetListFilterProps) {
  return (
    <ListFilter
      searchPlaceholder="Search assets..."
      statusOptions={statusOptions}
      systemOptions={systems}
    />
  )
}
