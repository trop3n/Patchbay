'use client'

import { useBuilder } from './state'
import { getPortColor } from './types'
import { ledPanelCatalog } from '@/lib/led-panel-catalog'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_PIXELS_PER_PORT = 650000

export function BottomBar() {
  const { state } = useBuilder()
  const { controllers, wallGroups, powerLines } = state.data

  const totalPanels = wallGroups.reduce((sum, g) => sum + g.rows * g.cols, 0)

  return (
    <div className="border-t border-zinc-800 bg-zinc-900">
      {controllers.length > 0 && (
        <div className="px-3 py-2 space-y-2">
          {controllers.map((ctrl) => (
            <div key={ctrl.id}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                {ctrl.name} &mdash; Port Capacity
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {ctrl.ports.map((port) => {
                  const color = getPortColor(ctrl.id, port.portIndex, controllers)
                  const assignedPixels = port.assignedPanels.reduce((sum, a) => {
                    const group = wallGroups.find((g) => g.id === a.groupId)
                    if (!group) return sum
                    const panelSpec = ledPanelCatalog.find((p) => p.id === group.panelSpecId)
                    if (!panelSpec) return sum
                    return sum + a.panelIndices.length * panelSpec.widthPx * panelSpec.heightPx
                  }, 0)
                  const percentage = Math.min(100, (assignedPixels / MAX_PIXELS_PER_PORT) * 100)
                  const isOverCapacity = assignedPixels > MAX_PIXELS_PER_PORT

                  return (
                    <div key={port.portIndex} className="flex items-center gap-1.5 min-w-[100px]">
                      <div className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0', color)}>
                        {port.portIndex + 1}
                      </div>
                      <div className="flex-1 min-w-[60px]">
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              isOverCapacity ? 'bg-red-500' : color,
                            )}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn(
                        'text-[10px] w-8 text-right',
                        isOverCapacity ? 'text-red-400 font-medium' : 'text-zinc-500',
                      )}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {powerLines.length > 0 && (
        <div className={cn('px-3 py-2', controllers.length > 0 && 'border-t border-zinc-800')}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Power Line Capacity
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {powerLines.map((pl) => {
              const assignedCount = pl.assignedPanels.reduce(
                (sum, a) => sum + a.panelIndices.length, 0
              )
              return (
                <div key={pl.id} className="flex items-center gap-1.5">
                  <Zap className="w-2.5 h-2.5 text-yellow-500" />
                  <span className="text-[10px] text-zinc-400">
                    {assignedCount} / {pl.maxAmps}A &middot; {pl.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {controllers.length === 0 && powerLines.length === 0 && (
        <div className="px-3 py-1.5">
          <span className="text-[10px] text-zinc-600">
            {totalPanels} panels &middot; {wallGroups.length} groups
          </span>
        </div>
      )}
    </div>
  )
}
