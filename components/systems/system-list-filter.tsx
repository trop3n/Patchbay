'use client'

import { ListFilter } from '@/components/ui/list-filter'

const statusOptions = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'DEGRADED', label: 'Degraded' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

interface SystemListFilterProps {
  categories?: string[]
}

export function SystemListFilter({ categories }: SystemListFilterProps) {
  return (
    <ListFilter
      searchPlaceholder="Search systems..."
      statusOptions={statusOptions}
      categoryOptions={categories}
    />
  )
}
