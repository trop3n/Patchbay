import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDiagram } from '@/app/actions/diagrams'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Calendar, User, Folder } from 'lucide-react'
import { DeleteDiagramButton } from '@/components/diagrams/delete-diagram-button'
import { DiagramViewer } from '@/components/diagrams/diagram-viewer'

interface DiagramDetailPageProps {
  params: Promise<{ id: string }>
}

const typeLabels: Record<string, string> = {
  SIGNAL_FLOW: 'Signal Flow',
  WHITEBOARD: 'Whiteboard',
  NETWORK: 'Network Topology',
  RACK_LAYOUT: 'Rack Layout',
}

export default async function DiagramDetailPage({ params }: DiagramDetailPageProps) {
  const { id } = await params
  const diagram = await getDiagram(id)

  if (!diagram) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/diagrams">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{diagram.title}</h1>
          {diagram.system && (
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Folder className="w-4 h-4" />
              <Link href={`/systems/${diagram.system.id}`} className="hover:underline">
                {diagram.system.name}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/diagrams/${diagram.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteDiagramButton diagramId={diagram.id} diagramTitle={diagram.title} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="font-medium">{diagram.createdBy.name || diagram.createdBy.username}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(diagram.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium">{typeLabels[diagram.type] || diagram.type}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {diagram.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap">{diagram.description}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Diagram</h2>
        <DiagramViewer data={diagram.data as { nodes: unknown[]; edges: unknown[] }} />
      </div>
    </div>
  )
}
