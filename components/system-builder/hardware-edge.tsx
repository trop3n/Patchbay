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
    borderRadius: 8,
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
        style={{ strokeWidth: 2, stroke: '#3F3F46', fill: 'none' }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: color,
          fill: 'none',
          strokeDasharray: '4 8',
          animation: 'dash-flow 1s linear infinite',
        }}
      />
    </>
  )
}

export const HardwareEdge = memo(HardwareEdgeComponent)
