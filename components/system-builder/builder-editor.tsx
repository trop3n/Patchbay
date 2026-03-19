'use client'

import { useCallback, useRef, useMemo } from 'react'
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
import { getHardwareType } from './hardware-types'
import type { HardwareNodeData } from './hardware-node'

const nodeTypes = { hardware: HardwareNode }
const edgeTypes = { hardware: HardwareEdge }

interface BuilderEditorProps {
  nodes: Node<HardwareNodeData>[]
  edges: Edge[]
  onNodesChange: (nodes: Node<HardwareNodeData>[]) => void
  onEdgesChange: (edges: Edge[]) => void
  readOnly?: boolean
}

export default function BuilderEditor({
  nodes,
  edges,
  onNodesChange: setNodes,
  onEdgesChange: setEdges,
  readOnly,
}: BuilderEditorProps) {
  const reactFlowRef = useRef<ReactFlowInstance<Node<HardwareNodeData>, Edge> | null>(null)

  const handleNodesChange: OnNodesChange<Node<HardwareNodeData>> = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes) as Node<HardwareNodeData>[])
    },
    [nodes, setNodes]
  )

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges]
  )

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'hardware',
        data: { color: '#3b82f6' },
      }
      setEdges([...edges, newEdge])
    },
    [edges, setEdges]
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

      const newNode: Node<HardwareNodeData> = {
        id: `${typeId}-${Date.now()}`,
        type: 'hardware',
        position,
        data: {
          hardwareTypeId: typeId,
          label: hwType.label,
          specs: hwType.defaultSpecs,
        },
      }

      setNodes([...nodes, newNode])
    },
    [nodes, setNodes]
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'hardware',
      data: { color: '#3b82f6' },
    }),
    []
  )

  return (
    <div className="relative h-full min-h-[500px] rounded-lg border border-zinc-800 bg-[#09090b]">
      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -12; }
        }
        .react-flow__controls {
          background: #111113 !important;
          border: 1px solid #27272a !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5) !important;
        }
        .react-flow__controls-button {
          background: #111113 !important;
          border-color: #27272a !important;
          fill: #a1a1aa !important;
        }
        .react-flow__controls-button:hover {
          background: #18181b !important;
        }
      `}</style>

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
        <Background gap={20} size={1} color="#A1A1AA" style={{ opacity: 0.25 }} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {!readOnly && <Toolbox />}

      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-full px-3 py-1.5 text-[10px] text-zinc-500">
            Drag from Library &middot; Click to select &middot; Backspace to delete
          </div>
        </div>
      )}
    </div>
  )
}
