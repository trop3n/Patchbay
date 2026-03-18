'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ledPanelCatalog, getBrands } from '@/lib/led-panel-catalog'
import type { WallGroup, WiringPattern } from './types'

interface WallGroupDialogProps {
  open: boolean
  onClose: () => void
  onSave: (group: Omit<WallGroup, 'id' | 'x' | 'y' | 'controllerAssignments'>) => void
  editGroup?: WallGroup | null
  defaultPanelSpecId?: string | null
}

export function WallGroupDialog({ open, onClose, onSave, editGroup, defaultPanelSpecId }: WallGroupDialogProps) {
  const [name, setName] = useState(editGroup?.name || '')
  const [cols, setCols] = useState(editGroup?.cols || 4)
  const [rows, setRows] = useState(editGroup?.rows || 3)
  const [panelSpecId, setPanelSpecId] = useState(editGroup?.panelSpecId || defaultPanelSpecId || ledPanelCatalog[0].id)
  const [wiringPattern, setWiringPattern] = useState<WiringPattern>(editGroup?.wiringPattern || 'S')
  const [brandFilter, setBrandFilter] = useState<string>('all')

  const brands = getBrands()
  const filteredPanels = brandFilter === 'all'
    ? ledPanelCatalog
    : ledPanelCatalog.filter((p) => p.brand === brandFilter)

  const selectedSpec = ledPanelCatalog.find((p) => p.id === panelSpecId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      cols,
      rows,
      panelSpecId,
      wiringPattern,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editGroup ? 'Edit Wall Group' : 'Add Wall Group'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Wall"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-cols">Columns</Label>
              <Input
                id="group-cols"
                type="number"
                min={1}
                max={50}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-rows">Rows</Label>
              <Input
                id="group-rows"
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Panel Spec</Label>
            <div className="flex gap-2">
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={panelSpecId} onValueChange={setPanelSpecId}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredPanels.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.brand} {p.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSpec && (
              <p className="text-xs text-muted-foreground">
                {selectedSpec.widthMm}×{selectedSpec.heightMm}mm | {selectedSpec.widthPx}×{selectedSpec.heightPx}px | P{selectedSpec.pixelPitch}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Wiring Pattern</Label>
            <Select value={wiringPattern} onValueChange={(v) => setWiringPattern(v as WiringPattern)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S-Pattern (snake)</SelectItem>
                <SelectItem value="Z">Z-Pattern (left-to-right)</SelectItem>
                <SelectItem value="N">N-Pattern (column snake)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSpec && (
            <div className="rounded-md bg-muted p-3 text-xs space-y-1">
              <p className="font-medium">Wall Dimensions</p>
              <p>
                {((selectedSpec.widthMm * cols) / 1000).toFixed(2)}m × {((selectedSpec.heightMm * rows) / 1000).toFixed(2)}m
              </p>
              <p>
                {selectedSpec.widthPx * cols} × {selectedSpec.heightPx * rows} pixels
              </p>
              <p>{cols * rows} panels total</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editGroup ? 'Save' : 'Add Group'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
