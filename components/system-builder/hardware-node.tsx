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
        'w-48 rounded-xl border border-zinc-800 bg-[#111113] shadow-lg transition-transform',
        selected && 'scale-[1.02] ring-1 ring-primary/50'
      )}
      style={{ borderTopWidth: 2, borderTopColor: color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-1.5 !rounded-sm !border-none !min-w-0 !min-h-0"
        style={{ backgroundColor: color }}
      />

      <div className="px-2.5 pt-2 pb-1 flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
        <span className="text-xs font-medium text-zinc-200 truncate flex-1">{data.label}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
      </div>

      <div className="px-2.5 pb-2.5">
        {data.model && (
          <p className="text-[9px] text-zinc-500 truncate mb-1">{data.model}</p>
        )}
        {data.specs && data.specs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.specs.map((spec) => (
              <span
                key={spec}
                className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400"
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
    </div>
  )
}

export const HardwareNode = memo(HardwareNodeComponent)
