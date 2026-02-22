'use client'

import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import type { RackUnit } from '@/app/actions/racks'

interface RackUnitRowProps {
  unit: RackUnit
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

export function RackUnitRow({ unit, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: RackUnitRowProps) {
  const heightPx = unit.height * 40 // 40px per U

  return (
    <div
      className="border-b last:border-b-0 bg-blue-500/10 border-blue-500/30 flex items-center px-2 gap-2"
      style={{ height: `${heightPx}px` }}
    >
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{unit.label || 'Unnamed'}</p>
        {(unit.manufacturer || unit.model) && (
          <p className="text-xs text-muted-foreground truncate">
            {unit.manufacturer} {unit.model}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{unit.height}U</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onRemove}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}
