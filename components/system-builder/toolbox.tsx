'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp, GripHorizontal, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  hardwareTypes,
  allCategories,
  categoryColors,
  categoryLabels,
} from './hardware-types'
import type { HardwareCategory } from './hardware-types'

interface ToolboxProps {
  className?: string
}

interface DragState {
  startX: number
  startY: number
  posX: number
  posY: number
  onMouseMove: (ev: MouseEvent) => void
  onMouseUp: () => void
  rafId: number | null
}

function clampPosition(x: number, y: number, el: HTMLElement | null) {
  if (typeof window === 'undefined') return { x, y }
  const margin = 8
  const width = el?.offsetWidth ?? 272
  const height = el?.offsetHeight ?? 200
  const maxX = Math.max(margin, window.innerWidth - width - margin)
  const maxY = Math.max(margin, window.innerHeight - height - margin)
  return {
    x: Math.min(Math.max(margin, x), maxX),
    y: Math.min(Math.max(margin, y), maxY),
  }
}

export function Toolbox({ className }: ToolboxProps) {
  const [minimized, setMinimized] = useState(false)
  const [activeCategory, setActiveCategory] = useState<HardwareCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState({ x: 16, y: 16 })
  const dragRef = useRef<DragState | null>(null)
  const toolboxRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(position)

  useEffect(() => {
    positionRef.current = position
  }, [position])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    let pendingX = positionRef.current.x
    let pendingY = positionRef.current.y

    const state: DragState = {
      startX: e.clientX,
      startY: e.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
      rafId: null,
      onMouseMove: (ev: MouseEvent) => {
        const s = dragRef.current
        if (!s) return
        const dx = ev.clientX - s.startX
        const dy = ev.clientY - s.startY
        const clamped = clampPosition(s.posX + dx, s.posY + dy, toolboxRef.current)
        pendingX = clamped.x
        pendingY = clamped.y
        if (s.rafId === null) {
          s.rafId = requestAnimationFrame(() => {
            s.rafId = null
            setPosition({ x: pendingX, y: pendingY })
          })
        }
      },
      onMouseUp: () => {
        const s = dragRef.current
        if (s?.rafId !== null && s?.rafId !== undefined) {
          cancelAnimationFrame(s.rafId)
        }
        document.removeEventListener('mousemove', state.onMouseMove)
        document.removeEventListener('mouseup', state.onMouseUp)
        dragRef.current = null
      },
    }

    dragRef.current = state
    document.addEventListener('mousemove', state.onMouseMove)
    document.addEventListener('mouseup', state.onMouseUp)
  }, [])

  useEffect(() => {
    return () => {
      const s = dragRef.current
      if (!s) return
      if (s.rafId !== null) cancelAnimationFrame(s.rafId)
      document.removeEventListener('mousemove', s.onMouseMove)
      document.removeEventListener('mouseup', s.onMouseUp)
      dragRef.current = null
    }
  }, [])

  useEffect(() => {
    function onResize() {
      setPosition((p) => clampPosition(p.x, p.y, toolboxRef.current))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filteredTypes = useMemo(() => {
    let items = activeCategory === 'all'
      ? hardwareTypes
      : hardwareTypes.filter((t) => t.category === activeCategory)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((t) =>
        t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      )
    }
    return items
  }, [activeCategory, search])

  function onItemDragStart(e: React.DragEvent, typeId: string) {
    e.dataTransfer.setData('application/reactflow', typeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      ref={toolboxRef}
      className={cn(
        'absolute z-20 rounded-xl border bg-card/95 backdrop-blur-sm shadow-2xl flex flex-col',
        'w-[17rem]',
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none border-b"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Library</span>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((v) => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={minimized ? 'Expand library' : 'Minimize library'}
        >
          {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!minimized && (
        <>
          <div className="px-2 pt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hardware..."
                className="w-full bg-background/80 border rounded-lg pl-6 pr-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <div className="border-b px-1.5 py-1.5 flex gap-0.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'flex-shrink-0 text-[9px] px-2 py-1.5 rounded-md transition-colors font-medium cursor-pointer',
                activeCategory === 'all'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1 text-[9px] px-2 py-1.5 rounded-md transition-colors font-medium cursor-pointer',
                  activeCategory === cat
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColors[cat] }}
                />
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="p-2 max-h-[320px] overflow-y-auto">
            {filteredTypes.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-muted-foreground">
                No matching hardware
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {filteredTypes.map((hw) => {
                  const Icon = hw.icon
                  const color = categoryColors[hw.category]
                  return (
                    <div
                      key={hw.id}
                      draggable
                      onDragStart={(e) => onItemDragStart(e, hw.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:border-foreground/30 hover:bg-muted/50 transition-all duration-150 bg-background/40 group"
                    >
                      <Icon
                        className="w-4 h-4 transition-transform duration-150 group-hover:scale-110"
                        style={{ color }}
                      />
                      <span className="text-[9px] text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">
                        {hw.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t px-3 py-1.5">
            <p className="text-[9px] text-muted-foreground text-center">
              Drag to canvas &middot; {filteredTypes.length} items
            </p>
          </div>
        </>
      )}
    </div>
  )
}
