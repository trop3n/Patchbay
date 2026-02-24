'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DiagramEditor } from '@/components/diagrams/diagram-editor'
import { ExcalidrawEditor } from '@/components/diagrams/excalidraw-editor'
import { updateDiagram } from '@/app/actions/diagrams'
import type { Diagram, System } from '@prisma/client'
import type { NodeType } from '@/components/diagrams/node-types'

interface DiagramEditFormProps {
  diagram: Diagram
  systems: Pick<System, 'id' | 'name'>[]
}

type DiagramTypeValue = 'SIGNAL_FLOW' | 'WHITEBOARD' | 'NETWORK' | 'RACK_LAYOUT'

export function DiagramEditForm({ diagram, systems }: DiagramEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(diagram.systemId || null)
  const [diagramType, setDiagramType] = useState<DiagramTypeValue>(diagram.type as DiagramTypeValue)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [excalidrawData, setExcalidrawData] = useState<unknown>(null)

  useEffect(() => {
    if (diagram.type === 'WHITEBOARD') {
      setExcalidrawData(diagram.data)
    } else {
      const diagramData = diagram.data as { nodes?: Node[]; edges?: Edge[] }
      if (diagramData?.nodes) {
        setNodes(diagramData.nodes.map((n) => ({ ...n, type: 'avNode' })))
      }
      if (diagramData?.edges) {
        setEdges(diagramData.edges)
      }
    }
  }, [diagram])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  )

  const handleAddNode = useCallback((type: NodeType, label: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'avNode',
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label,
        nodeType: type,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const type = formData.get('type') as DiagramTypeValue

    const data = type === 'WHITEBOARD'
      ? excalidrawData
      : {
          nodes: nodes.map((n) => ({ ...n, data: { ...n.data } })),
          edges,
        }

    const result = await updateDiagram(diagram.id, {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type,
      systemId: selectedSystemId,
      data,
    })

    if (result.success) {
      router.push(`/diagrams/${diagram.id}`)
    } else {
      setError(result.error || 'Failed to update diagram')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Edit Diagram</CardTitle>
        <CardDescription>Update diagram content</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Main Conference Room Signal Flow"
                defaultValue={diagram.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                name="type"
                defaultValue={diagram.type}
                onValueChange={(v) => setDiagramType(v as DiagramTypeValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIGNAL_FLOW">Signal Flow</SelectItem>
                  <SelectItem value="NETWORK">Network Topology</SelectItem>
                  <SelectItem value="RACK_LAYOUT">Rack Layout</SelectItem>
                  <SelectItem value="WHITEBOARD">Whiteboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">Associated System</Label>
            <Select
              value={selectedSystemId || '__none__'}
              onValueChange={(v) => setSelectedSystemId(v === '__none__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe this diagram..."
              rows={2}
              defaultValue={diagram.description || ''}
            />
          </div>

          <div className="space-y-2">
            <Label>Diagram Editor</Label>
            {diagramType === 'WHITEBOARD' ? (
              <ExcalidrawEditor
                data={excalidrawData}
                onChange={setExcalidrawData}
              />
            ) : (
              <DiagramEditor
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onAddNode={handleAddNode}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
