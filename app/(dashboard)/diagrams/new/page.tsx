import { prisma } from '@/lib/prisma'
import { DiagramForm } from '@/components/diagrams/diagram-form'

export const dynamic = 'force-dynamic'

export default async function NewDiagramPage() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <DiagramForm systems={systems} />
    </div>
  )
}
