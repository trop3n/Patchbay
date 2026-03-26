'use client'

import { useState } from 'react'
import { useBuilder } from './state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PowerLine } from './types'

export function PowerPanel() {
  const { state, dispatch } = useBuilder()
  const { powerLines } = state.data
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPowerLine, setEditPowerLine] = useState<PowerLine | null>(null)
  const [name, setName] = useState('')
  const [maxAmps, setMaxAmps] = useState(20)

  function openAdd() {
    setEditPowerLine(null)
    setName('')
    setMaxAmps(20)
    setDialogOpen(true)
  }

  function openEdit(pl: PowerLine) {
    setEditPowerLine(pl)
    setName(pl.name)
    setMaxAmps(pl.maxAmps)
    setDialogOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (editPowerLine) {
      dispatch({
        type: 'UPDATE_POWER_LINE',
        id: editPowerLine.id,
        updates: { name: name.trim(), maxAmps },
      })
    } else {
      dispatch({
        type: 'ADD_POWER_LINE',
        powerLine: {
          id: `pwr-${Date.now()}`,
          name: name.trim(),
          maxAmps,
          assignedPanels: [],
        },
      })
    }
    setDialogOpen(false)
  }

  function handleSelectPowerLine(id: string) {
    if (state.selectedPowerLineId === id) {
      dispatch({ type: 'SELECT_POWER_LINE', id: null })
    } else {
      dispatch({ type: 'SELECT_POWER_LINE', id })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Power Lines</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={openAdd}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {powerLines.length === 0 && (
        <p className="text-xs text-zinc-500">No power lines added</p>
      )}

      {powerLines.map((pl) => {
        const isSelected = state.selectedPowerLineId === pl.id
        const assignedCount = pl.assignedPanels.reduce((sum, a) => sum + a.panelIndices.length, 0)

        return (
          <button
            key={pl.id}
            type="button"
            onClick={() => handleSelectPowerLine(pl.id)}
            className={cn(
              'w-full flex items-center gap-2 rounded-md border p-2 text-left transition-colors',
              isSelected
                ? 'border-yellow-500 bg-zinc-800'
                : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800',
            )}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{pl.name}</p>
              <p className="text-[10px] text-zinc-500">
                {pl.maxAmps}A max | {assignedCount} panels
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openEdit(pl) }}
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={`Edit ${pl.name}`}
              >
                <Zap className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_POWER_LINE', id: pl.id }) }}
                className="p-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={`Delete ${pl.name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </button>
        )
      })}

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editPowerLine ? 'Edit Power Line' : 'Add Power Line'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwr-name">Name</Label>
              <Input
                id="pwr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Line A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwr-amps">Max Amps</Label>
              <Input
                id="pwr-amps"
                type="number"
                min={1}
                max={200}
                value={maxAmps}
                onChange={(e) => setMaxAmps(parseInt(e.target.value) || 20)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editPowerLine ? 'Save' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
