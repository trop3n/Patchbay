'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Search, Package, Server, ChevronRight } from 'lucide-react'
import { RackUnitRow } from './rack-unit-row'
import {
  avEquipmentCatalog,
  categoryLabels,
  type AvEquipmentSpec,
  type EquipmentCategory,
} from '@/lib/av-equipment-catalog'
import type { RackUnit } from '@/app/actions/racks'

interface RackBuilderProps {
  height: number
  units: RackUnit[]
  onHeightChange: (height: number) => void
  onUnitsChange: (units: RackUnit[]) => void
  assets: { id: string; name: string; manufacturer?: string | null; model?: string | null }[]
}

const rackSizes = [
  { value: '42', label: '42U' },
  { value: '21', label: '21U' },
  { value: '12', label: '12U' },
  { value: '6', label: '6U' },
  { value: '4', label: '4U' },
]

type PanelTab = 'catalog' | 'assets' | 'custom'

export function RackBuilder({ height, units, onHeightChange, onUnitsChange, assets }: RackBuilderProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('catalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null)
  const [selectedHeight, setSelectedHeight] = useState<number>(1)
  const [customLabel, setCustomLabel] = useState('')
  const [customManufacturer, setCustomManufacturer] = useState('')
  const [customModel, setCustomModel] = useState('')

  const occupiedPositions = useMemo(() => {
    const set = new Set<number>()
    units.forEach((unit) => {
      for (let i = 0; i < unit.height; i++) {
        set.add(unit.position + i)
      }
    })
    return set
  }, [units])

  const usedUnits = occupiedPositions.size
  const freeUnits = height - usedUnits

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
  }, [height, occupiedPositions])

  const addEquipment = useCallback((spec: AvEquipmentSpec) => {
    const rackUnits = spec.rackUnits || 1
    const position = findAvailablePosition(rackUnits)
    if (position === null) return

    const newUnit: RackUnit = {
      position,
      height: rackUnits,
      label: `${spec.brand} ${spec.model}`,
      manufacturer: spec.brand,
      model: spec.model,
    }

    onUnitsChange([...units, newUnit])
  }, [units, onUnitsChange, findAvailablePosition])

  const addAsset = useCallback((asset: { id: string; name: string; manufacturer?: string | null; model?: string | null }) => {
    const position = findAvailablePosition(1)
    if (position === null) return

    const newUnit: RackUnit = {
      position,
      height: 1,
      assetId: asset.id,
      label: asset.name,
      manufacturer: asset.manufacturer || undefined,
      model: asset.model || undefined,
    }

    onUnitsChange([...units, newUnit])
  }, [units, onUnitsChange, findAvailablePosition])

  const addCustom = useCallback(() => {
    const position = findAvailablePosition(selectedHeight)
    if (position === null) return

    const newUnit: RackUnit = {
      position,
      height: selectedHeight,
      label: customLabel || undefined,
      manufacturer: customManufacturer || undefined,
      model: customModel || undefined,
    }

    onUnitsChange([...units, newUnit])
    setCustomLabel('')
    setCustomManufacturer('')
    setCustomModel('')
    setSelectedHeight(1)
  }, [units, selectedHeight, customLabel, customManufacturer, customModel, onUnitsChange, findAvailablePosition])

  const removeUnit = useCallback((position: number) => {
    onUnitsChange(units.filter((u) => u.position !== position))
  }, [units, onUnitsChange])

  const moveUnit = useCallback((fromPosition: number, toPosition: number) => {
    const unitHeight = units.find((u) => u.position === fromPosition)?.height || 1
    if (toPosition < 1 || toPosition + unitHeight - 1 > height) return

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
    const validUnits = units.filter((u) => u.position + u.height - 1 <= newHeight)
    onUnitsChange(validUnits)
  }

  const catalogCategories = useMemo(() => {
    const cats = [...new Set(avEquipmentCatalog.map((e) => e.category))]
    return cats.map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      count: avEquipmentCatalog.filter((e) => e.category === cat).length,
    }))
  }, [])

  const filteredCatalog = useMemo(() => {
    let items = selectedCategory
      ? avEquipmentCatalog.filter((e) => e.category === selectedCategory)
      : avEquipmentCatalog
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((e) =>
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      )
    }
    return items
  }, [selectedCategory, searchQuery])

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return assets
    const q = searchQuery.toLowerCase()
    return assets.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.manufacturer?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q)
    )
  }, [assets, searchQuery])

  const rackSlots: { position: number; unit?: RackUnit; isOccupied: boolean }[] = []
  for (let pos = height; pos >= 1; pos--) {
    const unit = units.find((u) => u.position === pos)
    if (unit) {
      rackSlots.push({ position: pos, unit, isOccupied: true })
      for (let i = 1; i < unit.height; i++) {
        rackSlots.push({ position: pos - i, isOccupied: true })
      }
      pos -= unit.height - 1
    } else if (!occupiedPositions.has(pos)) {
      rackSlots.push({ position: pos, isOccupied: false })
    }
  }

  return (
    <div className="flex h-full gap-0">
      {/* Rack Visualization */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Rack Layout</span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={height.toString()} onValueChange={handleHeightChange}>
              <SelectTrigger className="w-24 h-8 text-xs">
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
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{usedUnits}U used</span>
              <span>{freeUnits}U free</span>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex justify-center py-6 px-4">
            <div className="w-full max-w-lg">
              <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg p-1 shadow-xl">
                <div className="h-3 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-t-md flex items-center justify-between px-2">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  </div>
                </div>
                <div className="flex">
                  <div className="flex flex-col w-8 shrink-0">
                    {rackSlots.map((slot, idx) => (
                      <div
                        key={`l-${idx}`}
                        className="flex items-center justify-center text-[9px] font-mono text-zinc-500 bg-zinc-800 border-b border-zinc-700/50"
                        style={{ height: slot.unit ? `${slot.unit.height * 28}px` : '28px' }}
                      >
                        {!slot.isOccupied && slot.position}
                        {slot.unit && slot.position}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-zinc-950/80">
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
                            className="h-7 border-b border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-800/50 transition-colors flex items-center justify-center"
                          >
                            <div className="w-full h-px bg-zinc-800/60 mx-1" />
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                  <div className="flex flex-col w-8 shrink-0">
                    {rackSlots.map((slot, idx) => (
                      <div
                        key={`r-${idx}`}
                        className="flex items-center justify-center text-[9px] font-mono text-zinc-500 bg-zinc-800 border-b border-zinc-700/50"
                        style={{ height: slot.unit ? `${slot.unit.height * 28}px` : '28px' }}
                      >
                        {!slot.isOccupied && slot.position}
                        {slot.unit && slot.position}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-3 bg-gradient-to-t from-zinc-600 to-zinc-700 rounded-b-md flex items-center justify-between px-2">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Equipment Panel */}
      <div className="w-80 shrink-0 border-l flex flex-col bg-background">
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Equipment</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {(['catalog', 'assets', 'custom'] as PanelTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setSearchQuery(''); setSelectedCategory(null) }}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'catalog' ? 'Catalog' : tab === 'assets' ? 'Assets' : 'Custom'}
            </button>
          ))}
        </div>

        {/* Catalog Tab */}
        {activeTab === 'catalog' && (
          <>
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment..."
                  className="h-8 text-xs pl-8"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {!selectedCategory && !searchQuery ? (
                <div className="p-2 space-y-0.5">
                  {catalogCategories.map(({ category, label, count }) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className="w-full flex items-center justify-between p-2.5 rounded-md text-left hover:bg-muted/80 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{count} devices</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  {selectedCategory && !searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 px-1"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                      All Categories
                    </button>
                  )}
                  <div className="space-y-0.5">
                    {filteredCatalog.map((spec) => (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => addEquipment(spec)}
                        disabled={spec.rackUnits > 0 && findAvailablePosition(spec.rackUnits) === null}
                        className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                      >
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {spec.rackUnits > 0 ? `${spec.rackUnits}U` : '—'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{spec.brand} {spec.model}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{spec.description}</p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                    {filteredCatalog.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No equipment found</p>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <>
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="h-8 text-xs pl-8"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => addAsset(asset)}
                    disabled={findAvailablePosition(1) === null}
                    className="w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      {(asset.manufacturer || asset.model) && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[asset.manufacturer, asset.model].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {assets.length === 0 ? 'No assets in inventory' : 'No assets found'}
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="p-3 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Label *</label>
              <Input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Equipment name"
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Manufacturer</label>
                <Input
                  value={customManufacturer}
                  onChange={(e) => setCustomManufacturer(e.target.value)}
                  placeholder="Brand"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Model</label>
                <Input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Model #"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Height</label>
              <Select value={selectedHeight.toString()} onValueChange={(v) => setSelectedHeight(parseInt(v, 10))}>
                <SelectTrigger className="h-8 text-xs">
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
            <Button
              type="button"
              onClick={addCustom}
              className="w-full h-8 text-xs"
              disabled={!customLabel.trim() || findAvailablePosition(selectedHeight) === null}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add to Rack
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
