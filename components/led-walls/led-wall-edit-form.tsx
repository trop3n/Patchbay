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
import { LedWallBuilder } from './led-wall-builder'
import { updateLedWall } from '@/app/actions/led-walls'
import type { LedWall, System } from '@prisma/client'

type LedWallTypeValue = 'VIDEO_WALL' | 'STRIP_LAYOUT'

type LedWallWithRelations = LedWall & {
  system: { id: string; name: string; slug: string } | null
  createdBy: { name: string | null; username: string; email: string }
}

interface LedWallEditFormProps {
  ledWall: LedWallWithRelations
  systems: Pick<System, 'id' | 'name'>[]
}

export function LedWallEditForm({ ledWall, systems }: LedWallEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(ledWall.systemId)
  const [layoutType, setLayoutType] = useState<LedWallTypeValue>(ledWall.type)

  const existingData = ledWall.data as { nodes?: Node[]; edges?: Edge[] } | null
  const [nodes, setNodes] = useState<Node[]>(existingData?.nodes || [])
  const [edges, setEdges] = useState<Edge[]>(existingData?.edges || [])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'ledConnection', data: { connectionType: 'data' } }, eds)),
    []
  )

  const handleAddNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node])
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await updateLedWall(ledWall.id, {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      type: layoutType,
      systemId: selectedSystemId || null,
      data: {
        nodes: nodes.map((n) => ({ ...n, data: { ...n.data } })),
        edges,
      },
    })

    if ('success' in result && result.success) {
      router.push(`/led-walls/${ledWall.id}`)
    } else {
      setError('error' in result ? result.error ?? 'Failed to update LED wall' : 'Failed to update LED wall')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Edit LED Wall</CardTitle>
        <CardDescription>Modify the LED wall layout and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required defaultValue={ledWall.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Layout Type</Label>
              <Select
                value={layoutType}
                onValueChange={(v) => setLayoutType(v as LedWallTypeValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO_WALL">Video Wall</SelectItem>
                  <SelectItem value="STRIP_LAYOUT">Strip Layout</SelectItem>
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
              defaultValue={ledWall.description || ''}
              placeholder="Describe this LED wall layout..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>LED Wall Builder</Label>
            <LedWallBuilder
              layoutType={layoutType}
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
