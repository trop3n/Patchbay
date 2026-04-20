'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { getHardwareType, categoryColors } from './hardware-types'
import type { NodeProps, Node } from '@xyflow/react'

export type HardwareNodeData = {
  hardwareTypeId: string
  label: string
  model?: string
  specs?: string[]
}

type HardwareNodeType = Node<HardwareNodeData, 'hardware'>

function HardwareNodeComponent({ data, selected }: NodeProps<HardwareNodeType>) {
  const hwType = getHardwareType(data.hardwareTypeId)
  const color = hwType ? categoryColors[hwType.category] : '#71717a'
  const Icon = hwType?.icon

  return (
    <div
      className={cn(
        'w-52 rounded-xl border bg-card shadow-lg transition-all duration-150',
        selected ? 'ring-1 ring-primary/60 shadow-primary/10 shadow-xl' : 'hover:border-foreground/30'
      )}
      style={{ borderTopWidth: 2, borderTopColor: color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-1.5 !rounded-sm !border-none !min-w-0 !min-h-0"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-in"
        className="!w-1.5 !h-3 !rounded-sm !border-none !min-w-0 !min-h-0"
        style={{ backgroundColor: color }}
      />

      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2">
        {Icon && (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}1f` }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
          </div>
        )}
        <span className="text-xs font-medium text-foreground truncate flex-1">{data.label}</span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: '#22c55e', boxShadow: '0 0 4px #22c55e80' }}
          aria-label="Online"
        />
      </div>

      <div className="px-3 pb-2.5">
        {data.model && (
          <p className="text-[10px] text-muted-foreground truncate mb-1.5">{data.model}</p>
        )}
        {data.specs && data.specs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.specs.map((spec) => (
              <span
                key={spec}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-1.5 !rounded-sm !border-none !min-w-0 !min-h-0"
        style={{ backgroundColor: color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-out"
        className="!w-1.5 !h-3 !rounded-sm !border-none !min-w-0 !min-h-0"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

export const HardwareNode = memo(HardwareNodeComponent)
