'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Toolbox } from './toolbox'
import { HardwareNode } from './hardware-node'
import { HardwareEdge } from './hardware-edge'
import { getHardwareType, categoryColors } from './hardware-types'

const nodeTypes = { hardware: HardwareNode }
const edgeTypes = { hardware: HardwareEdge }

interface BuilderEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onChange?: (nodes: Node[], edges: Edge[]) => void
  readOnly?: boolean
}

export default function BuilderEditor({
  initialNodes = [],
  initialEdges = [],
  onChange,
  readOnly,
}: BuilderEditorProps) {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null)
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const nodesRef = useRef<Node[]>(nodes)
  const onChangeRef = useRef(onChange)
  const didMountRef = useRef(false)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    onChangeRef.current?.(nodes, edges)
  }, [nodes, edges])

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    []
  )

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    []
  )

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return
      const sourceNode = nodesRef.current.find((n) => n.id === connection.source)
      const hwTypeId = sourceNode?.data?.hardwareTypeId as string | undefined
      const hwType = hwTypeId ? getHardwareType(hwTypeId) : undefined
      const color = hwType ? categoryColors[hwType.category] : '#3b82f6'

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'hardware',
        data: { color },
      }
      setEdges((eds) => [...eds, newEdge])
    },
    []
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const typeId = e.dataTransfer.getData('application/reactflow')
      if (!typeId || !reactFlowRef.current) return

      const hwType = getHardwareType(typeId)
      if (!hwType) return

      const position = reactFlowRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      const newNode: Node = {
        id: `${typeId}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        type: 'hardware',
        position,
        data: {
          hardwareTypeId: typeId,
          label: hwType.label,
          specs: hwType.defaultSpecs,
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    []
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'hardware',
      data: { color: '#3b82f6' },
    }),
    []
  )

  return (
    <div className="system-builder-canvas relative h-full min-h-[500px] rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : handleEdgesChange}
        onConnect={readOnly ? undefined : handleConnect}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
        onInit={(instance) => { reactFlowRef.current = instance }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background gap={20} size={0.8} color="hsl(var(--border))" style={{ opacity: 0.6 }} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {!readOnly && <Toolbox />}

      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card/95 backdrop-blur-sm border rounded-full px-4 py-1.5 text-[10px] text-muted-foreground flex items-center gap-2">
            <span>Drag from Library</span>
            <span className="w-px h-3 bg-border" />
            <span>Click to select</span>
            <span className="w-px h-3 bg-border" />
            <kbd className="px-1 py-0.5 rounded bg-muted text-foreground/70 text-[9px] font-mono">Del</kbd>
            <span>to remove</span>
          </div>
        </div>
      )}
    </div>
  )
}
