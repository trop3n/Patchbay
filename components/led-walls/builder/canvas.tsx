'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useBuilder } from './state'
import { WallGroup } from './wall-group'
import { ledPanelCatalog } from '@/lib/led-panel-catalog'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const CELL_SIZE = 40

interface CanvasProps {
  onEditGroup: (id: string) => void
  onCreateGroup: (cols: number, rows: number, x: number, y: number) => void
  readOnly?: boolean
  children?: ReactNode
}

export function Canvas({ onEditGroup, onCreateGroup, readOnly, children }: CanvasProps) {
  const { state, dispatch } = useBuilder()
  const { offsetX, offsetY, zoom } = state.data.canvas
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  const [dragPreview, setDragPreview] = useState<{
    startX: number
    startY: number
    cols: number
    rows: number
    canvasX: number
    canvasY: number
  } | null>(null)
  const dragRef = useRef<{
    startClientX: number
    startClientY: number
    canvasX: number
    canvasY: number
  } | null>(null)

  const hasSelectedPanel = !!state.selectedPanelSpecId
  const selectedSpec = hasSelectedPanel
    ? ledPanelCatalog.find((p) => p.id === state.selectedPanelSpecId)
    : null

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(0.2, Math.min(3, zoom * delta))
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const cx = e.clientX - rect.left
          const cy = e.clientY - rect.top
          const newOffsetX = cx - (cx - offsetX) * (newZoom / zoom)
          const newOffsetY = cy - (cy - offsetY) * (newZoom / zoom)
          dispatch({ type: 'SET_CANVAS', offsetX: newOffsetX, offsetY: newOffsetY, zoom: newZoom })
        }
      } else {
        dispatch({
          type: 'SET_CANVAS',
          offsetX: offsetX - e.deltaX,
          offsetY: offsetY - e.deltaY,
          zoom,
        })
      }
    },
    [offsetX, offsetY, zoom, dispatch]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  function clientToCanvas(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - offsetX) / zoom,
      y: (clientY - rect.top - offsetY) / zoom,
    }
  }

  function snapToGrid(val: number) {
    return Math.round(val / CELL_SIZE) * CELL_SIZE
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
      e.preventDefault()
      return
    }

    if (e.button === 0 && hasSelectedPanel && !readOnly) {
      const target = e.target as HTMLElement
      if (target !== containerRef.current && target !== containerRef.current?.querySelector('.canvas-transform')) {
        return
      }
      const canvas = clientToCanvas(e.clientX, e.clientY)
      const snappedX = snapToGrid(canvas.x)
      const snappedY = snapToGrid(canvas.y)
      dragRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        canvasX: snappedX,
        canvasY: snappedY,
      }
      setDragPreview({
        startX: snappedX,
        startY: snappedY,
        cols: 1,
        rows: 1,
        canvasX: snappedX,
        canvasY: snappedY,
      })
      e.preventDefault()
      return
    }

    if (e.button === 0) {
      if (!readOnly) {
        dispatch({ type: 'SELECT_GROUP', id: null })
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      dispatch({
        type: 'SET_CANVAS',
        offsetX: panStart.current.ox + dx,
        offsetY: panStart.current.oy + dy,
        zoom,
      })
      return
    }

    if (dragRef.current) {
      const canvas = clientToCanvas(e.clientX, e.clientY)
      const dx = canvas.x - dragRef.current.canvasX
      const dy = canvas.y - dragRef.current.canvasY
      const cols = Math.max(1, Math.round(Math.abs(dx) / CELL_SIZE) + 1)
      const rows = Math.max(1, Math.round(Math.abs(dy) / CELL_SIZE) + 1)
      const startX = dx >= 0 ? dragRef.current.canvasX : dragRef.current.canvasX - (cols - 1) * CELL_SIZE
      const startY = dy >= 0 ? dragRef.current.canvasY : dragRef.current.canvasY - (rows - 1) * CELL_SIZE
      setDragPreview({
        startX,
        startY,
        cols,
        rows,
        canvasX: startX,
        canvasY: startY,
      })
    }
  }

  function handleMouseUp() {
    isPanning.current = false

    if (dragRef.current && dragPreview) {
      const { cols, rows, canvasX, canvasY } = dragPreview
      if (cols > 0 && rows > 0) {
        onCreateGroup(cols, rows, canvasX, canvasY)
      }
      dragRef.current = null
      setDragPreview(null)
    }
  }

  const isEmpty = state.data.wallGroups.length === 0
  const isAssigning = !!state.selectedPortSelection || !!state.selectedPowerLineId

  let cursorClass = 'cursor-default'
  if (hasSelectedPanel && !readOnly) {
    cursorClass = 'cursor-crosshair'
  } else if (isPanning.current) {
    cursorClass = 'cursor-grabbing'
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex-1 overflow-hidden bg-zinc-950', cursorClass)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="canvas-transform absolute inset-0"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <svg className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-none" style={{ left: -5000, top: -5000 }}>
          <defs>
            <pattern id="grid-cell" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(113,113,122,0.10)" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid-block" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#grid-cell)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(113,113,122,0.20)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-block)" />
        </svg>

        {state.data.wallGroups.map((group) => (
          <WallGroup
            key={group.id}
            group={group}
            zoom={zoom}
            onEdit={onEditGroup}
            readOnly={readOnly}
          />
        ))}

        {dragPreview && (
          <div
            className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/10 pointer-events-none rounded"
            style={{
              left: dragPreview.canvasX,
              top: dragPreview.canvasY,
              width: dragPreview.cols * CELL_SIZE,
              height: dragPreview.rows * CELL_SIZE,
            }}
          >
            <span className="absolute -top-5 left-0 text-[10px] text-emerald-400 whitespace-nowrap">
              {dragPreview.cols} × {dragPreview.rows}
              {selectedSpec && (
                <> &middot; {selectedSpec.brand} {selectedSpec.model}</>
              )}
            </span>
          </div>
        )}
      </div>

      {!readOnly && !isAssigning && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {isEmpty && !hasSelectedPanel && (
            <div className="text-center space-y-2">
              <p className="text-sm text-zinc-500">Select a panel type from the sidebar to start</p>
              <p className="text-xs text-zinc-600">or use Alt+Drag to pan the canvas</p>
            </div>
          )}
          {hasSelectedPanel && !dragPreview && isEmpty && (
            <div className="text-center space-y-2">
              <p className="text-sm text-emerald-400/70">Click and drag to create panels</p>
              <p className="text-xs text-zinc-600">ESC to deselect panel type</p>
            </div>
          )}
        </div>
      )}

      {!readOnly && hasSelectedPanel && !isEmpty && !dragPreview && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-xs text-emerald-400/60 bg-zinc-900/80 px-3 py-1 rounded-full border border-emerald-500/20">
            Click and drag to create panels &middot; ESC to deselect
          </span>
        </div>
      )}

      {children}
    </div>
  )
}
