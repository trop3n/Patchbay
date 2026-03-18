'use client'

import { useState, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LedPanelNode } from './led-wall-panel-node'
import { LedStripNode } from './led-wall-strip-node'
import { LedProcessorNode } from './led-wall-processor-node'
import { LedConnectionEdge } from './led-wall-connection-edge'
import { RoutingDetailToggle } from './routing-detail-toggle'
import { isV2Data } from './builder/types'
import dynamic from 'next/dynamic'

const LedWallBuilderV2 = dynamic(
  () => import('./builder'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground animate-pulse bg-muted/50">
        Loading viewer...
      </div>
    ),
  }
)

interface LedWallDetailViewProps {
  data: unknown
}

const nodeTypes = {
  ledPanel: LedPanelNode,
  ledStrip: LedStripNode,
  ledProcessor: LedProcessorNode,
}

const edgeTypes = {
  ledConnection: LedConnectionEdge,
}

function V1DetailView({ data }: { data: { nodes?: Node[]; edges?: Edge[] } | null }) {
  const [showPorts, setShowPorts] = useState(false)

  const nodes = useMemo(
    () => (data?.nodes || []).map((n) => ({ ...n, data: { ...n.data, showPorts } })),
    [data?.nodes, showPorts]
  )

  const edges = useMemo(
    () => (data?.edges || []).map((e) => ({
      ...e,
      type: 'ledConnection',
      data: { ...((e.data as Record<string, unknown>) || {}), showPorts },
    })),
    [data?.edges, showPorts]
  )

  if (!data?.nodes?.length) {
    return (
      <div className="h-[400px] border rounded-lg flex items-center justify-center text-muted-foreground">
        No layout data
      </div>
    )
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={25} size={1} />
        <Controls showInteractive={false} />
        <MiniMap />
        <Panel position="top-left">
          <RoutingDetailToggle showPorts={showPorts} onToggle={() => setShowPorts((p) => !p)} />
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default function LedWallDetailView({ data }: LedWallDetailViewProps) {
  if (isV2Data(data)) {
    return (
      <div className="h-[600px]">
        <LedWallBuilderV2 initialData={data} readOnly />
      </div>
    )
  }

  return <V1DetailView data={data as { nodes?: Node[]; edges?: Edge[] } | null} />
}
