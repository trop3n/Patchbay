'use client'

import { useRef, useCallback, useState } from 'react'
import { useBuilder } from './state'
import { PanelCell } from './panel-cell'
import { WiringOverlay } from './wiring-overlay'
import { ledPanelCatalog } from '@/lib/led-panel-catalog'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WallGroup as WallGroupType } from './types'

interface WallGroupProps {
  group: WallGroupType
  zoom: number
  onEdit: (id: string) => void
  readOnly?: boolean
}

const CELL_SIZE = 40

export function WallGroup({ group, zoom, onEdit, readOnly }: WallGroupProps) {
  const { state, dispatch } = useBuilder()
  const isSelected = state.selectedGroupId === group.id
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const spec = ledPanelCatalog.find((s) => s.id === group.panelSpecId)
  const totalPanels = group.rows * group.cols

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return
    e.stopPropagation()
    dispatch({ type: 'SELECT_GROUP', id: group.id })
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: group.x,
      origY: group.y,
    }

    function handleMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const dx = (ev.clientX - dragRef.current.startX) / zoom
      const dy = (ev.clientY - dragRef.current.startY) / zoom
      if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        setIsDragging(true)
      }
      dispatch({
        type: 'MOVE_WALL_GROUP',
        id: group.id,
        x: Math.round(dragRef.current.origX + dx),
        y: Math.round(dragRef.current.origY + dy),
      })
    }

    function handleMouseUp() {
      dragRef.current = null
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [group.id, group.x, group.y, zoom, dispatch, readOnly, isDragging])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return
    e.stopPropagation()
    e.preventDefault()
    dispatch({ type: 'SELECT_GROUP', id: group.id })
    setIsResizing(true)

    const startClientX = e.clientX
    const startClientY = e.clientY
    const startCols = group.cols
    const startRows = group.rows
    let lastCols = startCols
    let lastRows = startRows

    function handleMouseMove(ev: MouseEvent) {
      const dx = (ev.clientX - startClientX) / zoom
      const dy = (ev.clientY - startClientY) / zoom
      const newCols = Math.max(1, startCols + Math.round(dx / CELL_SIZE))
      const newRows = Math.max(1, startRows + Math.round(dy / CELL_SIZE))
      if (newCols === lastCols && newRows === lastRows) return
      lastCols = newCols
      lastRows = newRows
      dispatch({ type: 'RESIZE_WALL_GROUP', id: group.id, cols: newCols, rows: newRows })
    }

    function handleMouseUp() {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [group.id, group.cols, group.rows, zoom, dispatch, readOnly])

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    dispatch({ type: 'DELETE_WALL_GROUP', id: group.id })
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    onEdit(group.id)
  }

  return (
    <div
      className={cn(
        'group/wall absolute select-none',
        (isDragging || isResizing) && 'z-10',
      )}
      style={{
        left: group.x,
        top: group.y,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!readOnly) dispatch({ type: 'SELECT_GROUP', id: group.id })
      }}
    >
      <div
        className={cn(
          'relative rounded-md border overflow-hidden',
          isSelected ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-zinc-700',
        )}
      >
        <div
          className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border-b border-zinc-700 text-xs text-zinc-300"
          onMouseDown={handleMouseDown}
        >
          {!readOnly && <GripVertical className="w-3 h-3 text-zinc-500 cursor-grab shrink-0" />}
          <span className="font-medium truncate">{group.name}</span>
          <span className="text-zinc-500 ml-auto shrink-0">
            {group.cols}×{group.rows}
          </span>
          {spec && (
            <span className="text-zinc-600 shrink-0">
              {spec.model}
            </span>
          )}
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="p-0.5 hover:text-white transition-colors shrink-0"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-0.5 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        <div className="relative">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${group.cols}, ${CELL_SIZE}px)`,
            }}
          >
            {Array.from({ length: totalPanels }, (_, i) => (
              <PanelCell
                key={i}
                group={group}
                panelIndex={i}
                readOnly={readOnly}
              />
            ))}
          </div>
          <WiringOverlay group={group} cellSize={CELL_SIZE} />
        </div>

        {!readOnly && (
          <div
            onMouseDown={handleResizeMouseDown}
            className={cn(
              'absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20',
              'opacity-0 group-hover/wall:opacity-100 transition-opacity',
              (isSelected || isResizing) && 'opacity-100',
            )}
            title="Drag to resize"
          >
            <svg
              viewBox="0 0 16 16"
              className={cn(
                'w-full h-full',
                isResizing ? 'text-blue-400' : 'text-zinc-400 hover:text-blue-400',
              )}
            >
              <path
                d="M14 6 L6 14 M14 10 L10 14 M14 14 L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
