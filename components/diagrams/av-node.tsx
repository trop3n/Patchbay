'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface AVNodeData {
  label: string
  nodeType: string
  icon?: string
}

const nodeColors: Record<string, string> = {
  videoSource: 'border-blue-500 bg-blue-500/10',
  display: 'border-blue-500 bg-blue-500/10',
  videoSwitcher: 'border-blue-400 bg-blue-400/10',
  processor: 'border-blue-300 bg-blue-300/10',
  audioSource: 'border-green-500 bg-green-500/10',
  speaker: 'border-green-500 bg-green-500/10',
  audioMixer: 'border-green-400 bg-green-400/10',
  amplifier: 'border-green-300 bg-green-300/10',
  controller: 'border-purple-500 bg-purple-500/10',
  networkSwitch: 'border-orange-500 bg-orange-500/10',
  touchPanel: 'border-purple-400 bg-purple-400/10',
  input: 'border-gray-500 bg-gray-500/10',
  output: 'border-gray-500 bg-gray-500/10',
  label: 'border-gray-400 bg-gray-400/10',
}

function AVNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AVNodeData
  const hasInputs = !['input', 'audioSource', 'videoSource', 'label'].includes(nodeData.nodeType)
  const hasOutputs = !['output', 'speaker', 'display', 'label'].includes(nodeData.nodeType)

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg border-2 min-w-[120px] text-center',
        nodeColors[nodeData.nodeType] || 'border-gray-500 bg-gray-500/10',
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
        {nodeData.icon && <span>{nodeData.icon}</span>}
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
