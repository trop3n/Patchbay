'use client'

import { useBuilder } from './state'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Undo2, Redo2, Maximize, Magnet, Unplug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ToolbarProps {
  onResetView: () => void
}

export function Toolbar({ onResetView }: ToolbarProps) {
  const { state, dispatch } = useBuilder()
  const { zoom } = state.data.canvas
  const [snap, setSnap] = useState(true)

  const hasAnyAssignments = state.data.wallGroups.some((g) => g.controllerAssignments.length > 0)
    || state.data.controllers.some((c) => c.ports.some((p) => p.assignedPanels.length > 0))

  function handleZoomIn() {
    const newZoom = Math.min(zoom * 1.2, 3)
    dispatch({
      type: 'SET_CANVAS',
      ...state.data.canvas,
      zoom: newZoom,
    })
  }

  function handleZoomOut() {
    const newZoom = Math.max(zoom / 1.2, 0.2)
    dispatch({
      type: 'SET_CANVAS',
      ...state.data.canvas,
      zoom: newZoom,
    })
  }

  function handleDisconnectAll() {
    dispatch({ type: 'DISCONNECT_ALL' })
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-zinc-900 border-b border-zinc-800">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
        onClick={handleZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
        onClick={handleZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </Button>
      <span className="text-xs text-zinc-500 w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
        onClick={onResetView}
        aria-label="Reset view"
      >
        <Maximize className="w-3.5 h-3.5" />
      </Button>

      <div className="w-px h-4 bg-zinc-700 mx-1" />

      <Button
        type="button"
        variant={snap ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'h-7 gap-1 text-xs',
          snap
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'text-zinc-400 hover:text-white',
        )}
        onClick={() => setSnap(!snap)}
      >
        <Magnet className="w-3 h-3" />
        Snap
      </Button>

      <div className="w-px h-4 bg-zinc-700 mx-1" />

      {hasAnyAssignments && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={handleDisconnectAll}
          title="Remove all port assignments"
        >
          <Unplug className="w-3 h-3" />
          Disconnect All
        </Button>
      )}

      <div className="w-px h-4 bg-zinc-700 mx-1" />

      <span className="text-xs text-zinc-600">
        Alt+Drag to pan
      </span>

      <div className="w-px h-4 bg-zinc-700 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={state.undoStack.length === 0}
        aria-label="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
        onClick={() => dispatch({ type: 'REDO' })}
        disabled={state.redoStack.length === 0}
        aria-label="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </Button>

      <div className="flex-1" />

      {state.selectedPortSelection && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
            Assigning port &middot; ESC to release
          </span>
        </div>
      )}

      {state.selectedPowerLineId && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
            Assigning power &middot; ESC to release
          </span>
        </div>
      )}
    </div>
  )
}
