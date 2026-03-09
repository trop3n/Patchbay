'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface LedStripNodeData {
  label: string
  chainOrder: number
  length: number
  pixelCount: number
  pixelPitch: number
  showPorts: boolean
  [key: string]: unknown
}

function LedStripNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as LedStripNodeData
  const width = Math.max(180, Math.min(d.length * 2, 400))

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-500/10',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{ minWidth: `${width}px`, height: '56px' }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="data-in"
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="data-out"
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />

      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {d.chainOrder}
        </span>
        <div>
          <div className="text-sm font-medium">{d.label}</div>
          <div className="text-xs text-muted-foreground">
            {d.length}m &middot; {d.pixelCount}px &middot; P{d.pixelPitch}
          </div>
        </div>
      </div>
      {d.showPorts && (
        <div className="text-[10px] text-blue-400 mt-0.5">DATA IN / OUT</div>
      )}
    </div>
  )
}

export const LedStripNode = memo(LedStripNodeComponent)
