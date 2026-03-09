'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LedPanelNode } from './led-wall-panel-node'
import { LedStripNode } from './led-wall-strip-node'
import { LedProcessorNode } from './led-wall-processor-node'
import { LedConnectionEdge } from './led-wall-connection-edge'
import { PanelPalette } from './panel-palette'
import { RoutingDetailToggle } from './routing-detail-toggle'
import type { LedPanelSpec } from '@/lib/led-panel-catalog'
import type { LedProcessorSpec } from '@/lib/led-processor-catalog'

interface LedWallBuilderProps {
  layoutType: 'VIDEO_WALL' | 'STRIP_LAYOUT'
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onAddNode: (node: Node) => void
}

const nodeTypes = {
  ledPanel: LedPanelNode,
  ledStrip: LedStripNode,
  ledProcessor: LedProcessorNode,
}

const edgeTypes = {
  ledConnection: LedConnectionEdge,
}

export function LedWallBuilder({
  layoutType,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
}: LedWallBuilderProps) {
  const [showPorts, setShowPorts] = useState(false)
  const [stripCounter, setStripCounter] = useState(1)

  const nodesWithPorts = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, showPorts } })),
    [nodes, showPorts]
  )

  const edgesWithPorts = useMemo(
    () => edges.map((e) => ({
      ...e,
      type: 'ledConnection',
      data: { ...((e.data as Record<string, unknown>) || {}), showPorts },
    })),
    [edges, showPorts]
  )

  const handleToggleDetail = useCallback(() => {
    setShowPorts((prev) => !prev)
  }, [])

  const handleAddPanel = useCallback((spec: LedPanelSpec) => {
    const newNode: Node = {
      id: `panel-${Date.now()}`,
      type: 'ledPanel',
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 300 },
      data: {
        label: spec.model,
        brand: spec.brand,
        model: spec.model,
        pixelPitch: spec.pixelPitch,
        widthMm: spec.widthMm,
        heightMm: spec.heightMm,
        widthPx: spec.widthPx,
        heightPx: spec.heightPx,
        showPorts: false,
      },
    }
    onAddNode(newNode)
  }, [onAddNode])

  const handleAddStrip = useCallback(() => {
    const order = stripCounter
    setStripCounter((c) => c + 1)
    const newNode: Node = {
      id: `strip-${Date.now()}`,
      type: 'ledStrip',
      position: { x: 200 + Math.random() * 300, y: 100 + order * 80 },
      data: {
        label: `Strip ${order}`,
        chainOrder: order,
        length: 5,
        pixelCount: 150,
        pixelPitch: 10,
        showPorts: false,
      },
    }
    onAddNode(newNode)
  }, [stripCounter, onAddNode])

  const handleAddProcessor = useCallback((spec: LedProcessorSpec) => {
    const newNode: Node = {
      id: `proc-${Date.now()}`,
      type: 'ledProcessor',
      position: { x: 50 + Math.random() * 100, y: 100 + Math.random() * 200 },
      data: {
        label: `${spec.brand} ${spec.model}`,
        brand: spec.brand,
        model: spec.model,
        outputs: spec.outputs,
        showPorts: false,
      },
    }
    onAddNode(newNode)
  }, [onAddNode])

  const defaultEdgeOptions = useMemo(() => ({
    type: 'ledConnection',
    data: { connectionType: 'data', showPorts },
  }), [showPorts])

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodesWithPorts}
        edges={edgesWithPorts}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[25, 25]}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={25} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <RoutingDetailToggle showPorts={showPorts} onToggle={handleToggleDetail} />
        </Panel>
        <Panel position="top-right">
          <PanelPalette
            layoutType={layoutType}
            onAddPanel={handleAddPanel}
            onAddStrip={handleAddStrip}
            onAddProcessor={handleAddProcessor}
          />
        </Panel>
      </ReactFlow>
    </div>
  )
}
