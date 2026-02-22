'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { RackUnitRow } from './rack-unit-row'
import type { RackUnit } from '@/app/actions/racks'

interface RackBuilderProps {
  height: number
  units: RackUnit[]
  onHeightChange: (height: number) => void
  onUnitsChange: (units: RackUnit[]) => void
  assets: { id: string; name: string; manufacturer?: string | null; model?: string | null }[]
}

const rackSizes = [
  { value: '42', label: 'Full Rack (42U)' },
  { value: '21', label: 'Half Rack (21U)' },
  { value: '12', label: '12U' },
  { value: '6', label: '6U (Wall Mount)' },
  { value: '4', label: '4U (Wall Mount)' },
]

export function RackBuilder({ height, units, onHeightChange, onUnitsChange, assets }: RackBuilderProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [selectedHeight, setSelectedHeight] = useState<number>(1)
  const [customLabel, setCustomLabel] = useState('')

  const occupiedPositions = new Set<number>()
  units.forEach((unit) => {
    for (let i = 0; i < unit.height; i++) {
      occupiedPositions.add(unit.position + i)
    }
  })

  const findAvailablePosition = useCallback((unitHeight: number): number | null => {
    for (let pos = 1; pos <= height - unitHeight + 1; pos++) {
      let canPlace = true
      for (let i = 0; i < unitHeight; i++) {
        if (occupiedPositions.has(pos + i)) {
          canPlace = false
          break
        }
      }
      if (canPlace) return pos
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, units])

  const addUnit = useCallback(() => {
    const position = findAvailablePosition(selectedHeight)
    if (position === null) {
      alert('Not enough space in rack')
      return
    }

    const asset = assets.find((a) => a.id === selectedAsset)
    const newUnit: RackUnit = {
      position,
      height: selectedHeight,
      assetId: selectedAsset || undefined,
      label: customLabel || asset?.name || undefined,
      manufacturer: asset?.manufacturer || undefined,
      model: asset?.model || undefined,
    }

    onUnitsChange([...units, newUnit])
    setSelectedAsset('')
    setCustomLabel('')
    setSelectedHeight(1)
  }, [units, selectedAsset, selectedHeight, customLabel, assets, onUnitsChange, findAvailablePosition])

  const removeUnit = useCallback((position: number) => {
    onUnitsChange(units.filter((u) => u.position !== position))
  }, [units, onUnitsChange])

  const moveUnit = useCallback((fromPosition: number, toPosition: number) => {
    const unitHeight = units.find((u) => u.position === fromPosition)?.height || 1
    
    // Check if target position is valid
    if (toPosition < 1 || toPosition + unitHeight - 1 > height) return
    
    // Check for collisions (excluding the moving unit)
    const otherUnits = units.filter((u) => u.position !== fromPosition)
    for (let i = 0; i < unitHeight; i++) {
      if (otherUnits.some((u) => {
        const uEnd = u.position + u.height - 1
        const targetEnd = toPosition + i
        return toPosition <= uEnd && targetEnd >= u.position
      })) {
        return
      }
    }

    onUnitsChange(
      units.map((u) =>
        u.position === fromPosition ? { ...u, position: toPosition } : u
      )
    )
  }, [units, height, onUnitsChange])

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value, 10)
    onHeightChange(newHeight)
    // Remove units that no longer fit
    const validUnits = units.filter((u) => u.position + u.height - 1 <= newHeight)
    onUnitsChange(validUnits)
  }

  // Create visual representation (U1 at top, U42 at bottom)
  const rackSlots: { position: number; unit?: RackUnit; isOccupied: boolean }[] = []
  for (let pos = height; pos >= 1; pos--) {
    const unit = units.find((u) => u.position === pos)
    if (unit) {
      rackSlots.push({ position: pos, unit, isOccupied: true })
      // Add placeholder slots for multi-unit equipment
      for (let i = 1; i < unit.height; i++) {
        rackSlots.push({ position: pos - i, isOccupied: true })
      }
      pos -= unit.height - 1
    } else if (!occupiedPositions.has(pos)) {
      rackSlots.push({ position: pos, isOccupied: false })
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Rack Layout ({height}U)</CardTitle>
              <Select value={height.toString()} onValueChange={handleHeightChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rackSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <div className="flex flex-col border rounded-l-lg overflow-hidden">
                {rackSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="h-10 w-10 flex items-center justify-center text-xs text-muted-foreground bg-muted/50 border-b last:border-b-0"
                  >
                    {slot.isOccupied ? '' : slot.position}
                  </div>
                ))}
              </div>
              <div className="flex-1 border border-l-0 rounded-r-lg overflow-hidden">
                {rackSlots.map((slot, idx) => {
                  if (slot.unit) {
                    return (
                      <RackUnitRow
                        key={slot.position}
                        unit={slot.unit}
                        onRemove={() => removeUnit(slot.unit!.position)}
                        onMoveUp={() => {
                          const newPos = slot.unit!.position + slot.unit!.height
                          if (newPos + slot.unit!.height - 1 <= height) {
                            moveUnit(slot.unit!.position, newPos)
                          }
                        }}
                        onMoveDown={() => {
                          const newPos = slot.unit!.position - 1
                          if (newPos >= 1) {
                            moveUnit(slot.unit!.position, newPos)
                          }
                        }}
                        isFirst={idx === 0}
                        isLast={idx === rackSlots.length - 1}
                      />
                    )
                  } else if (!slot.isOccupied) {
                    return (
                      <div
                        key={slot.position}
                        className="h-10 border-b last:border-b-0 bg-background hover:bg-muted/30 transition-colors"
                      />
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Add Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Link to Asset (optional)</Label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (manual entry)</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} {asset.manufacturer && `(${asset.manufacturer})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Equipment name"
            />
          </div>

          <div className="space-y-2">
            <Label>Height (U)</Label>
            <Select value={selectedHeight.toString()} onValueChange={(v) => setSelectedHeight(parseInt(v, 10))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((h) => (
                  <SelectItem key={h} value={h.toString()}>
                    {h}U
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addUnit} className="w-full" disabled={findAvailablePosition(selectedHeight) === null}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Rack
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
