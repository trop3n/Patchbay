'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react'
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

export function Toolbox({ className }: ToolboxProps) {
  const [minimized, setMinimized] = useState(false)
  const [activeCategory, setActiveCategory] = useState<HardwareCategory>('video')
  const [position, setPosition] = useState({ x: 16, y: 16 })
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null)
  const toolboxRef = useRef<HTMLDivElement>(null)

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    }

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setPosition({
        x: dragRef.current.posX + dx,
        y: dragRef.current.posY + dy,
      })
    }

    function onMouseUp() {
      dragRef.current = null
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [position])

  useEffect(() => {
    return () => {
      dragRef.current = null
    }
  }, [])

  const filteredTypes = hardwareTypes.filter((t) => t.category === activeCategory)

  function onItemDragStart(e: React.DragEvent, typeId: string) {
    e.dataTransfer.setData('application/reactflow', typeId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      ref={toolboxRef}
      className={cn(
        'absolute z-20 rounded-xl border border-zinc-800 bg-[#111113] shadow-xl flex flex-col',
        minimized ? 'w-[16.5rem]' : 'w-[16.5rem]',
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none border-b border-zinc-800"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Library</span>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((v) => !v)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!minimized && (
        <>
          <div className="p-2 max-h-[320px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-1.5">
              {filteredTypes.map((hw) => {
                const Icon = hw.icon
                const color = categoryColors[hw.category]
                return (
                  <div
                    key={hw.id}
                    draggable
                    onDragStart={(e) => onItemDragStart(e, hw.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-zinc-800 cursor-grab hover:border-primary/50 transition-colors bg-zinc-900/50"
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-[9px] text-zinc-400 text-center leading-tight">{hw.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-zinc-800 px-1 py-1 flex gap-0.5 overflow-x-auto">
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex-1 text-[9px] py-1.5 rounded-md transition-colors font-medium',
                  activeCategory === cat
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-800 px-3 py-1.5">
            <p className="text-[9px] text-zinc-600 text-center">Drag to canvas</p>
          </div>
        </>
      )}
    </div>
  )
}
