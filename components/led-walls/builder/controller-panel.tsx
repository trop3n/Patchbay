'use client'

import { useState } from 'react'
import { useBuilder } from './state'
import { getPortColor } from './types'
import type { Controller } from './types'
import { ledProcessorCatalog } from '@/lib/led-processor-catalog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ControllerPanel() {
  const { state, dispatch } = useBuilder()
  const { controllers } = state.data
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredProcessors = ledProcessorCatalog.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
  })

  function handleAddFromLibrary(specId: string) {
    const spec = ledProcessorCatalog.find((p) => p.id === specId)
    if (!spec) return
    dispatch({
      type: 'ADD_CONTROLLER',
      controller: {
        id: `ctrl-${Date.now()}`,
        processorSpecId: specId,
        name: `${spec.brand} ${spec.model}`,
        ports: Array.from({ length: spec.outputs }, (_, i) => ({
          portIndex: i,
          assignedPanels: [],
        })),
      },
    })
  }

  function handleDeleteController(id: string) {
    dispatch({ type: 'DELETE_CONTROLLER', id })
  }

  function handlePortClick(controllerId: string, portIndex: number) {
    const current = state.selectedPortSelection
    if (current?.controllerId === controllerId && current?.portIndex === portIndex) {
      dispatch({ type: 'SELECT_PORT', selection: null })
    } else {
      dispatch({ type: 'SELECT_PORT', selection: { controllerId, portIndex } })
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Add LED Controller
      </h3>
      <button
        type="button"
        onClick={() => { setSearch(''); setLibraryOpen(true) }}
        className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-zinc-700 px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
      >
        + Add Controller
      </button>

      {controllers.length > 0 && (
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 pt-2">
          Active Controllers
        </h3>
      )}

      {controllers.map((ctrl) => {
        const spec = ledProcessorCatalog.find((p) => p.id === ctrl.processorSpecId)
        return (
          <ControllerCard
            key={ctrl.id}
            controller={ctrl}
            spec={spec}
            state={state}
            onPortClick={handlePortClick}
            onDelete={handleDeleteController}
          />
        )
      })}

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Global Controller Library</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search controllers by name or short name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredProcessors.map((spec) => {
              const alreadyAdded = controllers.some((c) => c.processorSpecId === spec.id)
              return (
                <div
                  key={spec.id}
                  className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">
                      {spec.brand} {spec.model}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {spec.model} &middot; {spec.outputs} ports{spec.maxResolution ? ` \u00b7 ${spec.maxResolution}` : ''}
                    </p>
                  </div>
                  {alreadyAdded ? (
                    <span className="text-xs text-zinc-500 border border-zinc-600 rounded px-2 py-0.5">
                      In Library
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => handleAddFromLibrary(spec.id)}
                  >
                    Add
                  </Button>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-zinc-600 text-center pt-2">
            Showing {filteredProcessors.length} of {ledProcessorCatalog.length} controllers
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ControllerCardProps {
  controller: Controller
  spec: { brand: string; model: string; outputs: number } | undefined
  state: ReturnType<typeof useBuilder>['state']
  onPortClick: (controllerId: string, portIndex: number) => void
  onDelete: (id: string) => void
}

function ControllerCard({ controller, spec, state, onPortClick, onDelete }: ControllerCardProps) {
  const { controllers } = state.data

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-800/50 p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-200">{controller.name}</p>
          {spec && (
            <p className="text-[10px] text-zinc-500">
              {spec.brand} {spec.model} &middot; {spec.outputs} ports
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onDelete(controller.id)}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={`Delete ${controller.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500">Select port:</p>
      <div className="flex flex-wrap gap-1">
        {controller.ports.map((port) => {
          const isSelected =
            state.selectedPortSelection?.controllerId === controller.id &&
            state.selectedPortSelection?.portIndex === port.portIndex
          const color = getPortColor(controller.id, port.portIndex, controllers)
          const assignedCount = port.assignedPanels.reduce((sum, a) => sum + a.panelIndices.length, 0)
          const hasAssignments = assignedCount > 0

          return (
            <button
              key={port.portIndex}
              type="button"
              onClick={() => onPortClick(controller.id, port.portIndex)}
              className={cn(
                'w-7 h-7 rounded text-[10px] font-medium transition-all border',
                isSelected
                  ? `${color} text-white border-white ring-1 ring-white/50`
                  : hasAssignments
                    ? `${color} text-white border-transparent opacity-70 hover:opacity-100`
                    : 'bg-zinc-700 text-zinc-400 border-transparent hover:bg-zinc-600',
              )}
              title={`Port ${port.portIndex + 1}${assignedCount > 0 ? ` (${assignedCount} panels)` : ''}`}
            >
              {port.portIndex + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
