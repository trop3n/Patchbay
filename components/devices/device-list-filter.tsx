'use client'

import { ListFilter } from '@/components/ui/list-filter'

const statusOptions = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

interface DeviceListFilterProps {
  systems?: { id: string; name: string }[]
  deviceTypes?: string[]
}

export function DeviceListFilter({ systems, deviceTypes }: DeviceListFilterProps) {
  return (
    <ListFilter
      searchPlaceholder="Search devices..."
      statusOptions={statusOptions}
      systemOptions={systems}
      deviceTypeOptions={deviceTypes}
    />
  )
}
