import { notFound } from 'next/navigation'
import { getDiagram } from '@/app/actions/diagrams'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { DiagramEditForm } from '@/components/diagrams/diagram-edit-form'

interface EditDiagramPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDiagramPage({ params }: EditDiagramPageProps) {
  const { id } = await params
  const [diagram, systems] = await Promise.all([
    getDiagram(id),
    getSystemSelectOptions(),
  ])

  if (!diagram) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <DiagramEditForm diagram={diagram} systems={systems} />
    </div>
  )
}
