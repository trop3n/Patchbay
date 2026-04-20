'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createSystemBuild } from '@/app/actions/system-builds'
import type { System } from '@prisma/client'
import type { Node, Edge } from '@xyflow/react'

const BuilderEditor = dynamic(
  () => import('./builder-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[500px] border rounded-lg flex items-center justify-center text-muted-foreground animate-pulse bg-muted/50">
        Loading builder...
      </div>
    ),
  }
)

interface SystemBuildFormProps {
  systems: Pick<System, 'id' | 'name'>[]
}

export function SystemBuildForm({ systems }: SystemBuildFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)
  const [configOpen, setConfigOpen] = useState(true)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])

  const handleChange = useCallback((nodes: Node[], edges: Edge[]) => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await createSystemBuild({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      systemId: selectedSystemId || undefined,
      data: { nodes: nodesRef.current, edges: edgesRef.current },
    })

    if ('success' in result && result.success && 'build' in result) {
      router.push(`/system-builder/${result.build.id}`)
    } else {
      setError('error' in result ? result.error ?? 'Failed to create build' : 'Failed to create build')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex h-full gap-0">
      <div className={`shrink-0 flex transition-all duration-200 ${configOpen ? 'w-96' : 'w-0'}`}>
        <Card className={`overflow-hidden border-r rounded-r-none flex flex-col transition-all duration-200 ${configOpen ? 'w-96 opacity-100' : 'w-0 opacity-0 border-0'}`}>
          <CardHeader>
            <CardTitle>New System Build</CardTitle>
            <CardDescription>Design a hardware signal flow layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Conference Room A/V" />
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
                placeholder="Describe this system build..."
                rows={2}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Build'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setConfigOpen((prev) => !prev)}
        className="shrink-0 w-6 flex items-center justify-center border-y border-r rounded-r-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
        title={configOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {configOpen ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0 pl-4">
        <BuilderEditor
          onChange={handleChange}
        />
      </div>
    </form>
  )
}
