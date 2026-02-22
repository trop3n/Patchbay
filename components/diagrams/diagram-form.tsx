'use client'

import { useState, useCallback } from 'react'
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
import { createDiagram } from '@/app/actions/diagrams'
import type { System } from '@prisma/client'
import type { NodeType } from '@/components/diagrams/node-types'

interface DiagramFormProps {
  systems: Pick<System, 'id' | 'name'>[]
  systemId?: string
}

const nodeIcons: Record<NodeType, string> = {
  videoSource: '📹',
  display: '🖥️',
  videoSwitcher: '🔀',
  processor: '⚙️',
  audioSource: '🎤',
  speaker: '🔊',
  audioMixer: '🎛️',
  amplifier: '📢',
  controller: '🎮',
  networkSwitch: '🌐',
  touchPanel: '📱',
  input: '📥',
  output: '📤',
  label: '🏷️',
}

export function DiagramForm({ systems, systemId }: DiagramFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(systemId || null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

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
        icon: nodeIcons[type] || '📦',
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await createDiagram({
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type: (formData.get('type') as 'SIGNAL_FLOW' | 'WHITEBOARD' | 'NETWORK' | 'RACK_LAYOUT') || 'SIGNAL_FLOW',
      systemId: selectedSystemId || undefined,
      data: {
        nodes: nodes.map((n) => ({ ...n, data: { ...n.data } })),
        edges,
      },
    })

    if (result.success && result.diagram) {
      router.push(`/diagrams/${result.diagram.id}`)
    } else {
      setError(result.error || 'Failed to create diagram')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>New Diagram</CardTitle>
        <CardDescription>Create a signal flow or network diagram</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Main Conference Room Signal Flow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="SIGNAL_FLOW">
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
              value={selectedSystemId || ''}
              onValueChange={(v) => setSelectedSystemId(v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
            />
          </div>

          <div className="space-y-2">
            <Label>Diagram Editor</Label>
            <DiagramEditor
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onAddNode={handleAddNode}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Diagram'}
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
