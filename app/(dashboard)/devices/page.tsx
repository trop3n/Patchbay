import { Suspense } from 'react'
import { getFilteredDevices, getDeviceFilterOptions, type DeviceFilters } from '@/app/actions/devices'
import { DeviceList } from '@/components/devices/device-list'
import { DeviceListFilter } from '@/components/devices/device-list-filter'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface DevicesPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    systemId?: string
    deviceType?: string
  }>
}

export default async function DevicesPage({ searchParams }: DevicesPageProps) {
  const params = await searchParams

  const filters: DeviceFilters = {
    search: params.search,
    status: params.status as DeviceFilters['status'],
    systemId: params.systemId,
    deviceType: params.deviceType,
  }

  const [devices, filterOptions] = await Promise.all([
    getFilteredDevices(filters),
    getDeviceFilterOptions(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-muted-foreground">Monitor and manage network devices</p>
        </div>
        <Button asChild>
          <Link href="/devices/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div>Loading filters...</div>}>
        <DeviceListFilter
          systems={filterOptions.systems}
          deviceTypes={filterOptions.deviceTypes}
        />
      </Suspense>
      <DeviceList devices={devices} />
    </div>
  )
}
