'use client'

import { useBuilder } from './state'
import { getPortColor } from './types'
import type { WallGroup } from './types'
import { cn } from '@/lib/utils'

interface PanelCellProps {
  group: WallGroup
  panelIndex: number
  readOnly?: boolean
}

export function PanelCell({ group, panelIndex, readOnly }: PanelCellProps) {
  const { state, dispatch } = useBuilder()
  const { selectedPortSelection, selectedPowerLineId, wiringDisplay } = state
  const { controllers, powerLines } = state.data

  const assignment = group.controllerAssignments.find((a) =>
    a.panelIndices.includes(panelIndex)
  )

  const portColor = assignment
    ? getPortColor(assignment.controllerId, assignment.portIndex, controllers)
    : null

  const portChainIndex = assignment
    ? assignment.panelIndices.indexOf(panelIndex)
    : -1

  const powerAssignment = powerLines
    .flatMap((pl) => pl.assignedPanels.map((ap) => ({ pl, ap })))
    .find(({ ap }) => ap.groupId === group.id && ap.panelIndices.includes(panelIndex))
  const powerChainIndex = powerAssignment
    ? powerAssignment.ap.panelIndices.indexOf(panelIndex)
    : -1

  const showChainIndex = wiringDisplay === 'signal' ? portChainIndex : powerChainIndex

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (readOnly) return

    if (selectedPortSelection) {
      if (assignment) {
        dispatch({ type: 'UNASSIGN_PANEL', groupId: group.id, panelIndex })
      } else {
        dispatch({
          type: 'ASSIGN_PANELS_TO_PORT',
          controllerId: selectedPortSelection.controllerId,
          portIndex: selectedPortSelection.portIndex,
          groupId: group.id,
          panelIndices: [panelIndex],
        })
      }
    } else if (selectedPowerLineId) {
      const powerLine = state.data.powerLines.find((pl) => pl.id === selectedPowerLineId)
      const isPowerAssigned = powerLine?.assignedPanels.some(
        (a) => a.groupId === group.id && a.panelIndices.includes(panelIndex)
      )
      if (isPowerAssigned) {
        dispatch({ type: 'UNASSIGN_PANEL_FROM_POWER', groupId: group.id, panelIndex })
      } else {
        dispatch({
          type: 'ASSIGN_PANELS_TO_POWER',
          powerLineId: selectedPowerLineId,
          groupId: group.id,
          panelIndices: [panelIndex],
        })
      }
    }
  }

  const isAssignable = !readOnly && (selectedPortSelection || selectedPowerLineId)
  const row = Math.floor(panelIndex / group.cols) + 1
  const col = (panelIndex % group.cols) + 1

  return (
    <div
      onClick={handleClick}
      className={cn(
        'w-10 h-10 border border-zinc-700/60 flex flex-col items-center justify-center gap-0.5 transition-colors',
        portColor ? `${portColor} bg-opacity-60` : 'bg-zinc-900/80',
        isAssignable && 'cursor-pointer hover:border-white/50 hover:brightness-125',
        !isAssignable && !readOnly && 'cursor-default',
      )}
      title={`Panel [${row},${col}]${assignment ? ` — Port ${assignment.portIndex + 1}` : ''}`}
    >
      {showChainIndex >= 0 ? (
        <span className="text-[10px] leading-none font-bold text-white drop-shadow">
          {showChainIndex + 1}
        </span>
      ) : (
        <div
          className={cn(
            'w-3 h-3 rounded-full border',
            portColor ? 'border-white/40 bg-white/20' : 'border-zinc-600 bg-zinc-800',
          )}
        />
      )}
      <span className={cn(
        'text-[7px] leading-none font-medium',
        portColor ? 'text-white/70' : 'text-zinc-600',
      )}>
        {row},{col}
      </span>
    </div>
  )
}
