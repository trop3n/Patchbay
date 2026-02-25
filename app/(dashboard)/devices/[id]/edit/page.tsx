import { notFound } from 'next/navigation'
import { getDevice } from '@/app/actions/devices'
import { getSystems } from '@/app/actions/systems'
import { DeviceEditForm } from '@/components/devices/device-edit-form'

interface EditDevicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditDevicePage({ params }: EditDevicePageProps) {
  const { id } = await params
  const [device, systemsResult] = await Promise.all([
    getDevice(id),
    getSystems(),
  ])

  if (!device) {
    notFound()
  }

  const systems = systemsResult.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="space-y-6">
      <DeviceEditForm device={device} systems={systems} />
    </div>
  )
}
