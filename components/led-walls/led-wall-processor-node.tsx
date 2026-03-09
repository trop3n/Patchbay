'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface LedProcessorNodeData {
  label: string
  brand: string
  model: string
  outputs: number
  showPorts: boolean
  [key: string]: unknown
}

function LedProcessorNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as LedProcessorNodeData

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 border-purple-500 bg-purple-500/10 min-w-[160px]',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="signal-in"
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      {Array.from({ length: d.outputs }, (_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={`output-${i}`}
          className="w-3 h-3 bg-blue-400 border-2 border-white"
          style={{ top: `${((i + 1) / (d.outputs + 1)) * 100}%` }}
        />
      ))}

      <div className="text-sm font-medium">{d.label}</div>
      <div className="text-xs text-muted-foreground">{d.brand} {d.model}</div>
      <div className="text-xs text-muted-foreground">{d.outputs} outputs</div>
      {d.showPorts && (
        <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
          <span className="text-purple-400">SIG IN</span>
          <span className="text-blue-400">OUT 1-{d.outputs}</span>
        </div>
      )}
    </div>
  )
}

export const LedProcessorNode = memo(LedProcessorNodeComponent)
