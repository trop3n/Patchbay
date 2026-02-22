import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getDiagram } from '@/app/actions/diagrams'
import { DiagramEditForm } from '@/components/diagrams/diagram-edit-form'

interface EditDiagramPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDiagramPage({ params }: EditDiagramPageProps) {
  const { id } = await params
  const [diagram, systems] = await Promise.all([
    getDiagram(id),
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
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
