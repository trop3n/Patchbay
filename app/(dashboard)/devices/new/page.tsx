import { getSystems } from '@/app/actions/systems'
import { DeviceForm } from '@/components/devices/device-form'

export const dynamic = 'force-dynamic'

interface NewDevicePageProps {
  searchParams: Promise<{ systemId?: string }>
}

export default async function NewDevicePage({ searchParams }: NewDevicePageProps) {
  const params = await searchParams
  const systems = await getSystems()

  return (
    <div className="space-y-6">
      <DeviceForm systems={systems} systemId={params.systemId} />
    </div>
  )
}
