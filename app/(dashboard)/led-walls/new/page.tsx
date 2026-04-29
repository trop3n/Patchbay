import { getSystemSelectOptions } from '@/app/actions/systems'
import { LedWallForm } from '@/components/led-walls/led-wall-form'

export const dynamic = 'force-dynamic'

export default async function NewLedWallPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <LedWallForm systems={systems} />
    </div>
  )
}
