'use client'

import { useBuilder } from './state'
import { PORT_COLORS } from './types'
import type { WallGroup } from './types'

interface WiringOverlayProps {
  group: WallGroup
  cellSize: number
}

const POWER_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#dc2626',
  '#ea580c',
] as const

const TAILWIND_COLOR_HEX: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-rose-500': '#f43f5e',
  'bg-violet-500': '#8b5cf6',
  'bg-cyan-500': '#06b6d4',
  'bg-orange-500': '#f97316',
  'bg-pink-500': '#ec4899',
  'bg-lime-500': '#84cc16',
  'bg-indigo-500': '#6366f1',
  'bg-teal-500': '#14b8a6',
  'bg-red-500': '#ef4444',
}

interface Chain {
  panelIndices: number[]
  color: string
  key: string
}

export function WiringOverlay({ group, cellSize }: WiringOverlayProps) {
  const { state } = useBuilder()
  const { wiringDisplay, data } = state

  const chains: Chain[] = []

  if (wiringDisplay === 'signal') {
    let portIdx = 0
    for (const ctrl of data.controllers) {
      for (const port of ctrl.ports) {
        const assignment = port.assignedPanels.find((a) => a.groupId === group.id)
        if (assignment && assignment.panelIndices.length > 0) {
          const tw = PORT_COLORS[portIdx % PORT_COLORS.length]
          chains.push({
            panelIndices: assignment.panelIndices,
            color: TAILWIND_COLOR_HEX[tw] ?? '#facc15',
            key: `${ctrl.id}-${port.portIndex}`,
          })
        }
        portIdx++
      }
    }
  } else {
    data.powerLines.forEach((pl, i) => {
      const assignment = pl.assignedPanels.find((a) => a.groupId === group.id)
      if (assignment && assignment.panelIndices.length > 0) {
        chains.push({
          panelIndices: assignment.panelIndices,
          color: POWER_COLORS[i % POWER_COLORS.length],
          key: pl.id,
        })
      }
    })
  }

  if (chains.length === 0) return null

  const half = cellSize / 2

  function pointFor(idx: number) {
    const row = Math.floor(idx / group.cols)
    const col = idx % group.cols
    return { x: col * cellSize + half, y: row * cellSize + half }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={group.cols * cellSize}
      height={group.rows * cellSize}
    >
      {chains.map((chain) => {
        const points = chain.panelIndices.map(pointFor)
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        const start = points[0]
        const end = points[points.length - 1]
        return (
          <g key={chain.key}>
            <path
              d={d}
              fill="none"
              stroke={chain.color}
              strokeWidth={2}
              strokeOpacity={0.85}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={start.x} cy={start.y} r={3} fill="rgb(34,197,94)" />
            {points.length > 1 && (
              <circle cx={end.x} cy={end.y} r={3} fill="rgb(239,68,68)" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
