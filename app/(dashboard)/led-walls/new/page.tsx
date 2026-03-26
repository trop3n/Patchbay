import { getSystemSelectOptions } from '@/app/actions/systems'
import { LedWallForm } from '@/components/led-walls/led-wall-form'

export const dynamic = 'force-dynamic'

export default async function NewLedWallPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="h-full">
      <LedWallForm systems={systems} />
    </div>
  )
}
