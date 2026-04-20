'use client'

import { memo } from 'react'
import { BaseEdge, getSmoothStepPath } from '@xyflow/react'
import type { EdgeProps, Edge } from '@xyflow/react'

export type HardwareEdgeData = {
  color?: string
}

type HardwareEdgeType = Edge<HardwareEdgeData, 'hardware'>

function HardwareEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<HardwareEdgeType>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  })

  const color = data?.color || '#3b82f6'

  return (
    <>
      <BaseEdge
        id={`${id}-hit`}
        path={edgePath}
        style={{ strokeWidth: 24, stroke: 'transparent', fill: 'none' }}
      />
      <BaseEdge
        id={`${id}-base`}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? `${color}40` : 'hsl(var(--border))',
          fill: 'none',
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2.5 : 1.5,
          stroke: color,
          fill: 'none',
          strokeDasharray: '4 8',
          animation: 'dash-flow 0.8s linear infinite',
          opacity: selected ? 1 : 0.7,
        }}
      />
    </>
  )
}

export const HardwareEdge = memo(HardwareEdgeComponent)
