import { getSystemSelectOptions } from '@/app/actions/systems'
import { DiagramForm } from '@/components/diagrams/diagram-form'

export const dynamic = 'force-dynamic'

export default async function NewDiagramPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="space-y-6">
      <DiagramForm systems={systems} />
    </div>
  )
}
