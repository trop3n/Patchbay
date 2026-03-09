'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, Search } from 'lucide-react'
import { ledPanelCatalog, getBrands, type LedPanelSpec } from '@/lib/led-panel-catalog'
import { ledProcessorCatalog, type LedProcessorSpec } from '@/lib/led-processor-catalog'

interface PanelPaletteProps {
  layoutType: 'VIDEO_WALL' | 'STRIP_LAYOUT'
  onAddPanel: (spec: LedPanelSpec) => void
  onAddStrip: () => void
  onAddProcessor: (spec: LedProcessorSpec) => void
}

export function PanelPalette({ layoutType, onAddPanel, onAddStrip, onAddProcessor }: PanelPaletteProps) {
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState<string | null>(null)
  const brands = getBrands()

  const filteredPanels = ledPanelCatalog.filter((p) => {
    const matchesSearch = !search ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesBrand = !brandFilter || p.brand === brandFilter
    return matchesSearch && matchesBrand
  })

  const groupedPanels = filteredPanels.reduce<Record<string, LedPanelSpec[]>>((acc, p) => {
    if (!acc[p.brand]) acc[p.brand] = []
    acc[p.brand].push(p)
    return acc
  }, {})

  return (
    <div className="w-72 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-3 space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {layoutType === 'VIDEO_WALL' && (
        <>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={brandFilter === null ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setBrandFilter(null)}
            >
              All
            </Badge>
            {brands.map((brand) => (
              <Badge
                key={brand}
                variant={brandFilter === brand ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setBrandFilter(brandFilter === brand ? null : brand)}
              >
                {brand}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[320px]">
            <div className="space-y-3">
              {Object.entries(groupedPanels).map(([brand, panels]) => (
                <div key={brand}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{brand}</p>
                  <div className="space-y-1">
                    {panels.map((panel) => (
                      <div
                        key={panel.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{panel.model}</p>
                          <p className="text-xs text-muted-foreground">
                            P{panel.pixelPitch} &middot; {panel.widthMm}x{panel.heightMm}mm
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => onAddPanel(panel)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {layoutType === 'STRIP_LAYOUT' && (
        <Button variant="outline" className="w-full" onClick={onAddStrip}>
          <Plus className="w-4 h-4 mr-2" />
          Add Strip
        </Button>
      )}

      <Separator />

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">Processors</p>
        <div className="space-y-1">
          {ledProcessorCatalog.map((proc) => (
            <div
              key={proc.id}
              className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{proc.brand} {proc.model}</p>
                <p className="text-xs text-muted-foreground">{proc.outputs} outputs</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onAddProcessor(proc)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
