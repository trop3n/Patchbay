'use client'

import { memo } from 'react'
import { getBezierPath, type EdgeProps } from '@xyflow/react'

interface LedConnectionEdgeData {
  connectionType?: 'data' | 'power'
  showPorts?: boolean
  sourcePort?: string
  targetPort?: string
  [key: string]: unknown
}

function LedConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const d = data as unknown as LedConnectionEdgeData | undefined
  const connectionType = d?.connectionType || 'data'
  const showPorts = d?.showPorts || false
  const color = connectionType === 'power' ? '#f97316' : '#3b82f6'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeOpacity={0.8}
      />
      {showPorts && d?.sourcePort && d?.targetPort && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 10}
          width={80}
          height={20}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center text-[10px] font-medium rounded bg-background/90 border px-1 py-0.5" style={{ color }}>
            {d.sourcePort} → {d.targetPort}
          </div>
        </foreignObject>
      )}
    </>
  )
}

export const LedConnectionEdge = memo(LedConnectionEdgeComponent)
