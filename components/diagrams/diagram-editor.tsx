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
        <Panel position="top-left" className="bg-background border rounded-lg p-2 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">Add Node</h3>
          {Object.entries(groupedNodes).map(([category, nodes]) => (
            <div key={category} className="mb-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-1">{category}</h4>
              <div className="flex flex-wrap gap-1">
                {nodes.map((node) => (
                  <button
                    key={node.type}
                    onClick={() => onAddNode(node.type, node.label)}
                    className="text-xs px-2 py-1 rounded border bg-background hover:bg-muted transition-colors"
                    title={node.label}
                  >
                    {node.icon} {node.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      </ReactFlow>
    </div>
  )
}
