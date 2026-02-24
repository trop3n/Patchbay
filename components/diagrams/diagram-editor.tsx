'use client'

import {
  ReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Node,
  type Edge,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AVNode } from './av-node'
import { nodeTypes as availableNodeTypes, type NodeType } from './node-types'

const nodeTypes = { avNode: AVNode }

interface DiagramEditorProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onAddNode: (type: NodeType, label: string) => void
}

export function DiagramEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
}: DiagramEditorProps) {
  const groupedNodes = availableNodeTypes.reduce<Record<string, typeof availableNodeTypes[number][]>>((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {})

  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        <Controls />
        <Panel position="top-left" className="bg-background border rounded-lg p-2 max-h-[500px] overflow-y-auto w-64">
          <h3 className="text-sm font-semibold mb-2">Add Node</h3>
          {Object.entries(groupedNodes).map(([category, categoryNodes]) => (
            <div key={category} className="mb-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{category}</h4>
              <div className="grid grid-cols-2 gap-1">
                {categoryNodes.map((node) => {
                  const IconComponent = node.icon
                  return (
                    <button
                      key={node.type}
                      onClick={() => onAddNode(node.type as NodeType, node.label)}
                      className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded border bg-background hover:bg-muted transition-colors text-left"
                      title={node.description || node.label}
                    >
                      <IconComponent className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{node.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </Panel>
      </ReactFlow>
    </div>
  )
}
