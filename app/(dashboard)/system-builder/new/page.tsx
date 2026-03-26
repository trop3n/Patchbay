import { getSystemSelectOptions } from '@/app/actions/systems'
import { SystemBuildForm } from '@/components/system-builder/system-build-form'

export const dynamic = 'force-dynamic'

export default async function NewSystemBuildPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="h-full">
      <SystemBuildForm systems={systems} />
    </div>
  )
}
