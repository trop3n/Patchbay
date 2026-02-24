'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { nodeColors, getNodeTypeConfig } from './node-types'
import type { LucideIcon } from 'lucide-react'

interface AVNodeData {
  label: string
  nodeType: string
  iconName?: string
}

const inputNodeTypes = ['input', 'audioSource', 'videoSource', 'microphone', 'wirelessMic', 'camera', 'mediaPlayer', 'laptop', 'label', 'note']
const outputNodeTypes = ['output', 'speaker', 'headphones', 'display', 'projector', 'ledWall', 'label', 'note']

function AVNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AVNodeData
  const hasInputs = !inputNodeTypes.includes(nodeData.nodeType)
  const hasOutputs = !outputNodeTypes.includes(nodeData.nodeType)

  const config = getNodeTypeConfig(nodeData.nodeType)
  const colors = nodeColors[nodeData.nodeType] || { border: 'border-gray-500', bg: 'bg-gray-500/10' }
  const IconComponent = config?.icon

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg border-2 min-w-[120px] text-center',
        colors.border,
        colors.bg,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
      <div className="flex items-center justify-center gap-2">
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className="text-sm font-medium">{nodeData.label}</span>
      </div>
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  )
}

export const AVNode = memo(AVNodeComponent)
