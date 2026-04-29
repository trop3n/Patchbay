'use client'

import { useReducer, useCallback, useState, useEffect } from 'react'
import { BuilderContext, builderReducer, createInitialState } from './state'
import { Canvas } from './canvas'
import { Toolbar } from './toolbar'
import { PanelTypesPanel } from './panel-types-panel'
import { ControllerPanel } from './controller-panel'
import { PowerPanel } from './power-panel'
import { BottomBar } from './bottom-bar'
import { WallGroupDialog } from './wall-group-dialog'
import { ChevronLeft, ChevronRight, Zap, Cable } from 'lucide-react'
import type { LedWallDataV2, WallGroup } from './types'
import { createEmptyV2Data, isV2Data } from './types'
import { cn } from '@/lib/utils'

interface LedWallBuilderV2Props {
  initialData?: unknown
  onChange?: (data: LedWallDataV2) => void
  readOnly?: boolean
}

export default function LedWallBuilderV2({ initialData, onChange, readOnly }: LedWallBuilderV2Props) {
  const initial = isV2Data(initialData) ? initialData : createEmptyV2Data()
  const [state, dispatch] = useReducer(builderReducer, createInitialState(initial))
  const [editGroupId, setEditGroupId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    onChange?.(state.data)
  }, [state.data, onChange])

  useEffect(() => {
    if (readOnly) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_PORT', selection: null })
        dispatch({ type: 'SELECT_GROUP', id: null })
        dispatch({ type: 'SELECT_POWER_LINE', id: null })
        dispatch({ type: 'SELECT_PANEL_SPEC', specId: null })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          dispatch({ type: 'REDO' })
        } else {
          dispatch({ type: 'UNDO' })
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedGroupId && document.activeElement === document.body) {
          dispatch({ type: 'DELETE_WALL_GROUP', id: state.selectedGroupId })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [readOnly, state.selectedGroupId])

  const handleEditGroup = useCallback((id: string) => {
    setEditGroupId(id)
    setEditDialogOpen(true)
  }, [])

  const handleCreateGroup = useCallback((cols: number, rows: number, x: number, y: number) => {
    if (!state.selectedPanelSpecId) return
    const groupNumber = state.data.wallGroups.length + 1
    dispatch({
      type: 'ADD_WALL_GROUP',
      group: {
        name: `Group ${groupNumber}`,
        cols,
        rows,
        x,
        y,
        panelSpecId: state.selectedPanelSpecId,
        wiringPattern: 'S',
        id: `grp-${Date.now()}`,
        controllerAssignments: [],
      },
    })
  }, [state.selectedPanelSpecId, state.data.wallGroups.length, dispatch])

  function handleSaveGroup(data: Omit<WallGroup, 'id' | 'x' | 'y' | 'controllerAssignments'>) {
    if (editGroupId) {
      dispatch({
        type: 'UPDATE_WALL_GROUP',
        id: editGroupId,
        updates: data,
      })
    }
  }

  function handleResetView() {
    dispatch({ type: 'SET_CANVAS', offsetX: 0, offsetY: 0, zoom: 1 })
  }

  const editGroup = editGroupId
    ? state.data.wallGroups.find((g) => g.id === editGroupId) || null
    : null

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      <div className="flex flex-col flex-1 h-full min-h-[500px] rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
        <div className="flex flex-1 min-h-0">
          {!readOnly && (
            <>
              <div
                className={cn(
                  'shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-y-auto transition-all duration-200 flex flex-col',
                  sidebarOpen ? 'w-52 opacity-100' : 'w-0 opacity-0 border-0',
                )}
              >
                <div className={cn('space-y-4 flex-1', sidebarOpen ? 'p-3' : 'p-0')}>
                  <PanelTypesPanel />

                  <div className="border-t border-zinc-800" />

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Wiring Type
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_WIRING_DISPLAY', mode: 'power' })}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                          state.wiringDisplay === 'power'
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-zinc-500 hover:text-zinc-300',
                        )}
                      >
                        <Zap className="w-3 h-3" />
                        Power
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: 'SET_WIRING_DISPLAY',
                          mode: state.wiringDisplay === 'power' ? 'signal' : 'power',
                        })}
                        className={cn(
                          'w-8 h-4 rounded-full cursor-pointer transition-colors relative',
                          state.wiringDisplay === 'signal' ? 'bg-emerald-600' : 'bg-zinc-600',
                        )}
                        aria-label={`Switch to ${state.wiringDisplay === 'power' ? 'signal' : 'power'} wiring display`}
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all pointer-events-none',
                            state.wiringDisplay === 'signal' ? 'left-4' : 'left-0.5',
                          )}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'SET_WIRING_DISPLAY', mode: 'signal' })}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                          state.wiringDisplay === 'signal'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-zinc-500 hover:text-zinc-300',
                        )}
                      >
                        Signal
                        <Cable className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800" />

                  <ControllerPanel />

                  <div className="border-t border-zinc-800" />

                  <PowerPanel />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="shrink-0 w-5 flex items-center justify-center bg-zinc-900 border-r border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>
            </>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            {!readOnly && (
              <Toolbar onResetView={handleResetView} />
            )}
            <Canvas
              onEditGroup={handleEditGroup}
              onCreateGroup={handleCreateGroup}
              readOnly={readOnly}
            />
          </div>
        </div>

        {!readOnly && <BottomBar />}

        {!readOnly && (
          <WallGroupDialog
            open={editDialogOpen}
            onClose={() => { setEditDialogOpen(false); setEditGroupId(null) }}
            onSave={handleSaveGroup}
            editGroup={editGroup}
            defaultPanelSpecId={state.selectedPanelSpecId}
          />
        )}
      </div>
    </BuilderContext.Provider>
  )
}
