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

const unitColors = [
  'from-blue-500/20 to-blue-600/10 border-blue-500/40',
  'from-violet-500/20 to-violet-600/10 border-violet-500/40',
  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40',
  'from-amber-500/20 to-amber-600/10 border-amber-500/40',
  'from-rose-500/20 to-rose-600/10 border-rose-500/40',
  'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40',
]

function hashColor(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) - hash) + label.charCodeAt(i)
    hash |= 0
  }
  return unitColors[Math.abs(hash) % unitColors.length]
}

export function RackUnitRow({ unit, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: RackUnitRowProps) {
  const heightPx = unit.height * 28
  const colorClass = hashColor(unit.label || unit.manufacturer || 'default')

  return (
    <div
      className={`group relative bg-gradient-to-r ${colorClass} border rounded-sm mx-0.5 flex items-center px-2 gap-2 transition-all hover:brightness-110`}
      style={{ height: `${heightPx}px` }}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="min-w-0">
          <p className="font-medium text-xs truncate leading-tight">{unit.label || 'Unnamed'}</p>
          {unit.height > 1 && (unit.manufacturer || unit.model) && (
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {[unit.manufacturer, unit.model].filter(Boolean).join(' ')}
            </p>
          )}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{unit.height}U</span>
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move unit up"
        >
          <ChevronUp className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move unit down"
        >
          <ChevronDown className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={onRemove} aria-label="Remove unit">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
