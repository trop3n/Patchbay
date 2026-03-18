'use client'

import type { WallGroup, WiringPattern } from './types'

interface WiringOverlayProps {
  group: WallGroup
  cellSize: number
}

function getWiringPath(rows: number, cols: number, pattern: WiringPattern): number[] {
  const indices: number[] = []
  for (let r = 0; r < rows; r++) {
    if (pattern === 'S') {
      if (r % 2 === 0) {
        for (let c = 0; c < cols; c++) indices.push(r * cols + c)
      } else {
        for (let c = cols - 1; c >= 0; c--) indices.push(r * cols + c)
      }
    } else if (pattern === 'Z') {
      for (let c = 0; c < cols; c++) indices.push(r * cols + c)
    } else {
      for (let c = 0; c < cols; c++) {
        if (c % 2 === 0) {
          indices.push(c * rows + r)
        } else {
          indices.push(c * rows + (rows - 1 - r))
        }
      }
    }
  }
  if (pattern === 'N') {
    const sorted: number[] = []
    for (let c = 0; c < cols; c++) {
      if (c % 2 === 0) {
        for (let r = 0; r < rows; r++) sorted.push(r * cols + c)
      } else {
        for (let r = rows - 1; r >= 0; r--) sorted.push(r * cols + c)
      }
    }
    return sorted
  }
  return indices
}

export function WiringOverlay({ group, cellSize }: WiringOverlayProps) {
  const path = getWiringPath(group.rows, group.cols, group.wiringPattern)
  if (path.length < 2) return null

  const half = cellSize / 2
  const points = path.map((idx) => {
    const row = Math.floor(idx / group.cols)
    const col = idx % group.cols
    return { x: col * cellSize + half, y: row * cellSize + half }
  })

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={group.cols * cellSize}
      height={group.rows * cellSize}
    >
      <path
        d={d}
        fill="none"
        stroke="rgba(250,204,21,0.5)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[0].x} cy={points[0].y} r={3} fill="rgb(34,197,94)" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill="rgb(239,68,68)" />
    </svg>
  )
}
