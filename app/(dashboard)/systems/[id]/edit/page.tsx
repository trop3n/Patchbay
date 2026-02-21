import { notFound } from 'next/navigation'
import { getSystem } from '@/app/actions/systems'
import { SystemEditForm } from '@/components/systems/system-edit-form'

interface EditSystemPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSystemPage({ params }: EditSystemPageProps) {
  const { id } = await params
  const system = await getSystem(id)

  if (!system) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <SystemEditForm system={system} />
    </div>
  )
}
