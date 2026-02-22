'use client'

import { useMemo } from 'react'
import {
  ReactFlow,
  type Node,
  type Edge,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AVNode } from './av-node'
import { ExcalidrawViewer } from './excalidraw-viewer'

interface DiagramViewerProps {
  data: { nodes: unknown[]; edges: unknown[] }
  type?: 'SIGNAL_FLOW' | 'WHITEBOARD' | 'NETWORK' | 'RACK_LAYOUT'
}

export function DiagramViewer({ data, type }: DiagramViewerProps) {
  const nodeTypes = useMemo(() => ({ avNode: AVNode }), [])

  const nodes = useMemo(() => {
    if (!data?.nodes) return []
    return (data.nodes as Node[]).map((n) => ({
      ...n,
      type: 'avNode',
    }))
  }, [data?.nodes])

  const edges = useMemo(() => {
    if (!data?.edges) return []
    return data.edges as Edge[]
  }, [data?.edges])

  if (type === 'WHITEBOARD') {
    return <ExcalidrawViewer data={data} />
  }

  if (!data?.nodes?.length) {
    return (
      <div className="h-[400px] border rounded-lg flex items-center justify-center text-muted-foreground">
        No diagram data
      </div>
    )
  }

  return (
    <div className="h-[500px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
