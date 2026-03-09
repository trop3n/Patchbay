'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { brandColors } from '@/lib/led-panel-catalog'

interface LedPanelNodeData {
  label: string
  brand: string
  model: string
  pixelPitch: number
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  showPorts: boolean
  [key: string]: unknown
}

function LedPanelNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as LedPanelNodeData
  const colors = brandColors[d.brand] || 'border-gray-500 bg-gray-500/10'

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[160px]',
        colors,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="data-in"
        className="w-3 h-3 bg-blue-400 border-2 border-white"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="data-out"
        className="w-3 h-3 bg-blue-400 border-2 border-white"
        style={{ top: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="power-in"
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />

      <div className="text-sm font-medium">{d.label}</div>
      <div className="text-xs text-muted-foreground">{d.model}</div>
      <div className="text-xs text-muted-foreground">
        P{d.pixelPitch} &middot; {d.widthMm}x{d.heightMm}mm
      </div>
      {d.showPorts && (
        <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
          <span className="text-blue-400">DATA</span>
          <span className="text-orange-400">PWR</span>
        </div>
      )}
    </div>
  )
}

export const LedPanelNode = memo(LedPanelNodeComponent)
