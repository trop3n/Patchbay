'use client'

import { useState } from 'react'
import { useBuilder } from './state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ledPanelCatalog } from '@/lib/led-panel-catalog'
import type { LedPanelSpec } from '@/lib/led-panel-catalog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PanelTypesPanel() {
  const { state, dispatch } = useBuilder()
  const { activePanelSpecs, selectedPanelSpecId } = state
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredPanels = ledPanelCatalog.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      `${p.widthMm}x${p.heightMm}`.includes(q) ||
      `${p.widthPx}x${p.heightPx}`.includes(q) ||
      `p${p.pixelPitch}`.includes(q)
    )
  })

  function handleAddPanel(spec: LedPanelSpec) {
    dispatch({ type: 'ADD_PANEL_SPEC', specId: spec.id })
  }

  function handleRemovePanel(specId: string) {
    dispatch({ type: 'REMOVE_PANEL_SPEC', specId })
  }

  function handleSelectPanel(specId: string) {
    dispatch({
      type: 'SELECT_PANEL_SPEC',
      specId: selectedPanelSpecId === specId ? null : specId,
    })
  }

  const isInProject = (id: string) => activePanelSpecs.includes(id)

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Quick Panel Types
      </h3>

      {activePanelSpecs.map((specId) => {
        const spec = ledPanelCatalog.find((p) => p.id === specId)
        if (!spec) return null
        const isSelected = selectedPanelSpecId === specId
        return (
          <div
            key={specId}
            onClick={() => handleSelectPanel(specId)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer transition-colors',
              isSelected
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600',
            )}
          >
            <div
              className="w-5 h-4 rounded-sm border border-zinc-600 shrink-0"
              style={{
                aspectRatio: `${spec.widthMm} / ${spec.heightMm}`,
                backgroundColor: isSelected ? 'rgb(16, 185, 129)' : 'rgb(59, 130, 246)',
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {spec.brand} {spec.model}
              </p>
              <p className="text-[10px] text-zinc-500">
                {spec.widthMm}x{spec.heightMm}mm &middot; {spec.widthPx}x{spec.heightPx}px
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemovePanel(specId) }}
              className="p-0.5 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => { setSearch(''); setLibraryOpen(true) }}
        className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-zinc-700 px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
      >
        + Add Panel Type
      </button>

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Global Panel Library</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search panels by name, size, or pixels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredPanels.map((spec) => {
              const added = isInProject(spec.id)
              return (
                <div
                  key={spec.id}
                  className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                >
                  <div
                    className="w-6 h-5 rounded-sm shrink-0"
                    style={{
                      aspectRatio: `${spec.widthMm} / ${spec.heightMm}`,
                      backgroundColor: 'rgb(59, 130, 246)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">
                      {spec.brand} {spec.model}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {spec.widthMm}x{spec.heightMm}mm &middot; {spec.widthPx}x{spec.heightPx}px
                    </p>
                  </div>
                  {added ? (
                    <span className="text-xs text-zinc-500 border border-zinc-600 rounded px-2 py-0.5">
                      Added
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => handleAddPanel(spec)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              )
            })}
            {filteredPanels.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No panels found</p>
            )}
          </div>
          <p className="text-xs text-zinc-600 text-center pt-2">
            Showing {filteredPanels.length} of {ledPanelCatalog.length} panels
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
