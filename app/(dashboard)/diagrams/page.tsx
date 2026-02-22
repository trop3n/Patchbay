import { prisma } from '@/lib/prisma'
import { DiagramList } from '@/components/diagrams/diagram-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DiagramsPage() {
  const diagrams = await prisma.diagram.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diagrams</h1>
          <p className="text-muted-foreground">Signal flow and network diagrams</p>
        </div>
        <Button asChild>
          <Link href="/diagrams/new">
            <Plus className="w-4 h-4 mr-2" />
            New Diagram
          </Link>
        </Button>
      </div>
      <DiagramList diagrams={diagrams} />
    </div>
  )
}
