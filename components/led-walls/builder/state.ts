'use client'

import { createContext, useContext } from 'react'
import type {
  LedWallDataV2,
  WallGroup,
  Controller,
  PowerLine,
  PortSelection,
} from './types'
import { createEmptyV2Data } from './types'

export type BuilderAction =
  | { type: 'LOAD_DATA'; data: LedWallDataV2 }
  | { type: 'SET_CANVAS'; offsetX: number; offsetY: number; zoom: number }
  | { type: 'ADD_WALL_GROUP'; group: WallGroup }
  | { type: 'UPDATE_WALL_GROUP'; id: string; updates: Partial<Omit<WallGroup, 'id'>> }
  | { type: 'DELETE_WALL_GROUP'; id: string }
  | { type: 'MOVE_WALL_GROUP'; id: string; x: number; y: number }
  | { type: 'RESIZE_WALL_GROUP'; id: string; cols: number; rows: number }
  | { type: 'ADD_CONTROLLER'; controller: Controller }
  | { type: 'UPDATE_CONTROLLER'; id: string; updates: Partial<Omit<Controller, 'id'>> }
  | { type: 'DELETE_CONTROLLER'; id: string }
  | { type: 'ASSIGN_PANELS_TO_PORT'; controllerId: string; portIndex: number; groupId: string; panelIndices: number[] }
  | { type: 'UNASSIGN_PANEL'; groupId: string; panelIndex: number }
  | { type: 'ADD_POWER_LINE'; powerLine: PowerLine }
  | { type: 'UPDATE_POWER_LINE'; id: string; updates: Partial<Omit<PowerLine, 'id'>> }
  | { type: 'DELETE_POWER_LINE'; id: string }
  | { type: 'ASSIGN_PANELS_TO_POWER'; powerLineId: string; groupId: string; panelIndices: number[] }
  | { type: 'UNASSIGN_PANEL_FROM_POWER'; groupId: string; panelIndex: number }
  | { type: 'SELECT_PORT'; selection: PortSelection | null }
  | { type: 'SELECT_GROUP'; id: string | null }
  | { type: 'SELECT_POWER_LINE'; id: string | null }
  | { type: 'ADD_PANEL_SPEC'; specId: string }
  | { type: 'REMOVE_PANEL_SPEC'; specId: string }
  | { type: 'SELECT_PANEL_SPEC'; specId: string | null }
  | { type: 'SET_WIRING_DISPLAY'; mode: 'power' | 'signal' }
  | { type: 'AUTO_ROUTE_PORT'; controllerId: string; portIndex: number; groupId: string; pattern: 'S' | 'Z' | 'N' }
  | { type: 'AUTO_ROUTE_POWER_LINE'; powerLineId: string; groupId: string; pattern: 'S' | 'Z' | 'N' }
  | { type: 'DISCONNECT_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }

export interface BuilderState {
  data: LedWallDataV2
  selectedPortSelection: PortSelection | null
  selectedGroupId: string | null
  selectedPowerLineId: string | null
  activePanelSpecs: string[]
  selectedPanelSpecId: string | null
  wiringDisplay: 'power' | 'signal'
  undoStack: LedWallDataV2[]
  redoStack: LedWallDataV2[]
}

function computeAutoRouteOrder(rows: number, cols: number, pattern: 'S' | 'Z' | 'N'): number[] {
  const out: number[] = []
  if (pattern === 'Z') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) out.push(r * cols + c)
    }
    return out
  }
  if (pattern === 'S') {
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < cols; c++) out.push(r * cols + c)
      } else {
        for (let c = cols - 1; c >= 0; c--) out.push(r * cols + c)
      }
    }
    return out
  }
  for (let c = 0; c < cols; c++) {
    if (c % 2 === 0) {
      for (let r = 0; r < rows; r++) out.push(r * cols + c)
    } else {
      for (let r = rows - 1; r >= 0; r--) out.push(r * cols + c)
    }
  }
  return out
}

function mergeOrdered(existing: number[], incoming: number[]): number[] {
  const seen = new Set(existing)
  const result = [...existing]
  for (const i of incoming) {
    if (!seen.has(i)) {
      seen.add(i)
      result.push(i)
    }
  }
  return result
}

function deriveActivePanelSpecs(data: LedWallDataV2): string[] {
  const specIds = new Set<string>()
  for (const group of data.wallGroups) {
    specIds.add(group.panelSpecId)
  }
  return [...specIds]
}

export function createInitialState(data?: LedWallDataV2): BuilderState {
  const d = data || createEmptyV2Data()
  return {
    data: d,
    selectedPortSelection: null,
    selectedGroupId: null,
    selectedPowerLineId: null,
    activePanelSpecs: deriveActivePanelSpecs(d),
    selectedPanelSpecId: null,
    wiringDisplay: 'signal',
    undoStack: [],
    redoStack: [],
  }
}

function pushUndo(state: BuilderState): { undoStack: LedWallDataV2[]; redoStack: LedWallDataV2[] } {
  return {
    undoStack: [...state.undoStack.slice(-49), state.data],
    redoStack: [],
  }
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.data,
        activePanelSpecs: deriveActivePanelSpecs(action.data),
      }

    case 'SET_CANVAS':
      return {
        ...state,
        data: {
          ...state.data,
          canvas: { offsetX: action.offsetX, offsetY: action.offsetY, zoom: action.zoom },
        },
      }

    case 'ADD_WALL_GROUP': {
      const newData = {
        ...state.data,
        wallGroups: [...state.data.wallGroups, action.group],
      }
      return {
        ...state,
        ...pushUndo(state),
        data: newData,
        activePanelSpecs: state.activePanelSpecs.includes(action.group.panelSpecId)
          ? state.activePanelSpecs
          : [...state.activePanelSpecs, action.group.panelSpecId],
      }
    }

    case 'UPDATE_WALL_GROUP':
      return {
        ...state,
        ...pushUndo(state),
        data: {
          ...state.data,
          wallGroups: state.data.wallGroups.map((g) =>
            g.id === action.id ? { ...g, ...action.updates } : g
          ),
        },
      }

    case 'DELETE_WALL_GROUP': {
      const undo = pushUndo(state)
      const controllers = state.data.controllers.map((c) => ({
        ...c,
        ports: c.ports.map((p) => ({
          ...p,
          assignedPanels: p.assignedPanels.filter((a) => a.groupId !== action.id),
        })),
      }))
      const powerLines = state.data.powerLines.map((pl) => ({
        ...pl,
        assignedPanels: pl.assignedPanels.filter((a) => a.groupId !== action.id),
      }))
      return {
        ...state,
        ...undo,
        selectedGroupId: state.selectedGroupId === action.id ? null : state.selectedGroupId,
        data: {
          ...state.data,
          wallGroups: state.data.wallGroups.filter((g) => g.id !== action.id),
          controllers,
          powerLines,
        },
      }
    }

    case 'MOVE_WALL_GROUP':
      return {
        ...state,
        data: {
          ...state.data,
          wallGroups: state.data.wallGroups.map((g) =>
            g.id === action.id ? { ...g, x: action.x, y: action.y } : g
          ),
        },
      }

    case 'RESIZE_WALL_GROUP': {
      const target = state.data.wallGroups.find((g) => g.id === action.id)
      if (!target) return state
      const cols = Math.max(1, Math.floor(action.cols))
      const rows = Math.max(1, Math.floor(action.rows))
      if (target.cols === cols && target.rows === rows) return state
      const maxIndex = cols * rows
      const wallGroups = state.data.wallGroups.map((g) => {
        if (g.id !== action.id) return g
        return {
          ...g,
          cols,
          rows,
          controllerAssignments: g.controllerAssignments
            .map((a) => ({ ...a, panelIndices: a.panelIndices.filter((i) => i < maxIndex) }))
            .filter((a) => a.panelIndices.length > 0),
        }
      })
      const controllers = state.data.controllers.map((c) => ({
        ...c,
        ports: c.ports.map((p) => ({
          ...p,
          assignedPanels: p.assignedPanels
            .map((ap) =>
              ap.groupId === action.id
                ? { ...ap, panelIndices: ap.panelIndices.filter((i) => i < maxIndex) }
                : ap
            )
            .filter((ap) => ap.panelIndices.length > 0),
        })),
      }))
      const powerLines = state.data.powerLines.map((pl) => ({
        ...pl,
        assignedPanels: pl.assignedPanels
          .map((ap) =>
            ap.groupId === action.id
              ? { ...ap, panelIndices: ap.panelIndices.filter((i) => i < maxIndex) }
              : ap
          )
          .filter((ap) => ap.panelIndices.length > 0),
      }))
      return { ...state, data: { ...state.data, wallGroups, controllers, powerLines } }
    }

    case 'ADD_CONTROLLER':
      return {
        ...state,
        ...pushUndo(state),
        data: {
          ...state.data,
          controllers: [...state.data.controllers, action.controller],
        },
      }

    case 'UPDATE_CONTROLLER':
      return {
        ...state,
        ...pushUndo(state),
        data: {
          ...state.data,
          controllers: state.data.controllers.map((c) =>
            c.id === action.id ? { ...c, ...action.updates } : c
          ),
        },
      }

    case 'DELETE_CONTROLLER': {
      const undo = pushUndo(state)
      const wallGroups = state.data.wallGroups.map((g) => ({
        ...g,
        controllerAssignments: g.controllerAssignments.filter((a) => a.controllerId !== action.id),
      }))
      return {
        ...state,
        ...undo,
        selectedPortSelection: state.selectedPortSelection?.controllerId === action.id ? null : state.selectedPortSelection,
        data: {
          ...state.data,
          controllers: state.data.controllers.filter((c) => c.id !== action.id),
          wallGroups,
        },
      }
    }

    case 'ASSIGN_PANELS_TO_PORT': {
      const undo = pushUndo(state)
      const controllers = state.data.controllers.map((c) => {
        if (c.id !== action.controllerId) return c
        return {
          ...c,
          ports: c.ports.map((p) => {
            if (p.portIndex !== action.portIndex) return p
            const existing = p.assignedPanels.find((a) => a.groupId === action.groupId)
            if (existing) {
              return {
                ...p,
                assignedPanels: p.assignedPanels.map((a) =>
                  a.groupId === action.groupId
                    ? { ...a, panelIndices: mergeOrdered(a.panelIndices, action.panelIndices) }
                    : a
                ),
              }
            }
            return {
              ...p,
              assignedPanels: [...p.assignedPanels, { groupId: action.groupId, panelIndices: action.panelIndices }],
            }
          }),
        }
      })

      const wallGroups = state.data.wallGroups.map((g) => {
        if (g.id !== action.groupId) return g
        const existing = g.controllerAssignments.find(
          (a) => a.controllerId === action.controllerId && a.portIndex === action.portIndex
        )
        if (existing) {
          return {
            ...g,
            controllerAssignments: g.controllerAssignments.map((a) =>
              a.controllerId === action.controllerId && a.portIndex === action.portIndex
                ? { ...a, panelIndices: mergeOrdered(a.panelIndices, action.panelIndices) }
                : a
            ),
          }
        }
        return {
          ...g,
          controllerAssignments: [
            ...g.controllerAssignments,
            { controllerId: action.controllerId, portIndex: action.portIndex, panelIndices: action.panelIndices },
          ],
        }
      })

      return { ...state, ...undo, data: { ...state.data, controllers, wallGroups } }
    }

    case 'UNASSIGN_PANEL': {
      const undo = pushUndo(state)
      const controllers = state.data.controllers.map((c) => ({
        ...c,
        ports: c.ports.map((p) => ({
          ...p,
          assignedPanels: p.assignedPanels
            .map((a) =>
              a.groupId === action.groupId
                ? { ...a, panelIndices: a.panelIndices.filter((i) => i !== action.panelIndex) }
                : a
            )
            .filter((a) => a.panelIndices.length > 0),
        })),
      }))
      const wallGroups = state.data.wallGroups.map((g) => {
        if (g.id !== action.groupId) return g
        return {
          ...g,
          controllerAssignments: g.controllerAssignments
            .map((a) => ({
              ...a,
              panelIndices: a.panelIndices.filter((i) => i !== action.panelIndex),
            }))
            .filter((a) => a.panelIndices.length > 0),
        }
      })
      return { ...state, ...undo, data: { ...state.data, controllers, wallGroups } }
    }

    case 'ADD_POWER_LINE':
      return {
        ...state,
        ...pushUndo(state),
        data: {
          ...state.data,
          powerLines: [...state.data.powerLines, action.powerLine],
        },
      }

    case 'UPDATE_POWER_LINE':
      return {
        ...state,
        ...pushUndo(state),
        data: {
          ...state.data,
          powerLines: state.data.powerLines.map((pl) =>
            pl.id === action.id ? { ...pl, ...action.updates } : pl
          ),
        },
      }

    case 'DELETE_POWER_LINE':
      return {
        ...state,
        ...pushUndo(state),
        selectedPowerLineId: state.selectedPowerLineId === action.id ? null : state.selectedPowerLineId,
        data: {
          ...state.data,
          powerLines: state.data.powerLines.filter((pl) => pl.id !== action.id),
        },
      }

    case 'ASSIGN_PANELS_TO_POWER': {
      const undo = pushUndo(state)
      const powerLines = state.data.powerLines.map((pl) => {
        if (pl.id !== action.powerLineId) return pl
        const existing = pl.assignedPanels.find((a) => a.groupId === action.groupId)
        if (existing) {
          return {
            ...pl,
            assignedPanels: pl.assignedPanels.map((a) =>
              a.groupId === action.groupId
                ? { ...a, panelIndices: mergeOrdered(a.panelIndices, action.panelIndices) }
                : a
            ),
          }
        }
        return {
          ...pl,
          assignedPanels: [...pl.assignedPanels, { groupId: action.groupId, panelIndices: action.panelIndices }],
        }
      })
      return { ...state, ...undo, data: { ...state.data, powerLines } }
    }

    case 'UNASSIGN_PANEL_FROM_POWER': {
      const undo = pushUndo(state)
      const powerLines = state.data.powerLines.map((pl) => ({
        ...pl,
        assignedPanels: pl.assignedPanels
          .map((a) =>
            a.groupId === action.groupId
              ? { ...a, panelIndices: a.panelIndices.filter((i) => i !== action.panelIndex) }
              : a
          )
          .filter((a) => a.panelIndices.length > 0),
      }))
      return { ...state, ...undo, data: { ...state.data, powerLines } }
    }

    case 'SELECT_PORT':
      return { ...state, selectedPortSelection: action.selection, selectedPowerLineId: null }

    case 'SELECT_GROUP':
      return { ...state, selectedGroupId: action.id }

    case 'SELECT_POWER_LINE':
      return { ...state, selectedPowerLineId: action.id, selectedPortSelection: null }

    case 'ADD_PANEL_SPEC':
      if (state.activePanelSpecs.includes(action.specId)) return state
      return {
        ...state,
        activePanelSpecs: [...state.activePanelSpecs, action.specId],
        selectedPanelSpecId: action.specId,
      }

    case 'REMOVE_PANEL_SPEC': {
      const inUse = state.data.wallGroups.some((g) => g.panelSpecId === action.specId)
      if (inUse) return state
      return {
        ...state,
        activePanelSpecs: state.activePanelSpecs.filter((id) => id !== action.specId),
        selectedPanelSpecId: state.selectedPanelSpecId === action.specId ? null : state.selectedPanelSpecId,
      }
    }

    case 'SELECT_PANEL_SPEC':
      return { ...state, selectedPanelSpecId: action.specId }

    case 'SET_WIRING_DISPLAY':
      return { ...state, wiringDisplay: action.mode }

    case 'AUTO_ROUTE_PORT': {
      const group = state.data.wallGroups.find((g) => g.id === action.groupId)
      if (!group) return state
      const order = computeAutoRouteOrder(group.rows, group.cols, action.pattern)
      const undo = pushUndo(state)
      const controllers = state.data.controllers.map((c) => {
        if (c.id !== action.controllerId) return c
        return {
          ...c,
          ports: c.ports.map((p) => {
            if (p.portIndex !== action.portIndex) return p
            const others = p.assignedPanels.filter((a) => a.groupId !== action.groupId)
            return {
              ...p,
              assignedPanels: [...others, { groupId: action.groupId, panelIndices: order }],
            }
          }),
        }
      })
      const wallGroups = state.data.wallGroups.map((g) => {
        if (g.id !== action.groupId) return g
        const others = g.controllerAssignments.filter(
          (a) => !(a.controllerId === action.controllerId && a.portIndex === action.portIndex)
        )
        return {
          ...g,
          controllerAssignments: [
            ...others,
            { controllerId: action.controllerId, portIndex: action.portIndex, panelIndices: order },
          ],
        }
      })
      return { ...state, ...undo, data: { ...state.data, controllers, wallGroups } }
    }

    case 'AUTO_ROUTE_POWER_LINE': {
      const group = state.data.wallGroups.find((g) => g.id === action.groupId)
      if (!group) return state
      const order = computeAutoRouteOrder(group.rows, group.cols, action.pattern)
      const undo = pushUndo(state)
      const powerLines = state.data.powerLines.map((pl) => {
        if (pl.id !== action.powerLineId) return pl
        const others = pl.assignedPanels.filter((a) => a.groupId !== action.groupId)
        return {
          ...pl,
          assignedPanels: [...others, { groupId: action.groupId, panelIndices: order }],
        }
      })
      return { ...state, ...undo, data: { ...state.data, powerLines } }
    }

    case 'DISCONNECT_ALL': {
      const undo = pushUndo(state)
      const controllers = state.data.controllers.map((c) => ({
        ...c,
        ports: c.ports.map((p) => ({ ...p, assignedPanels: [] })),
      }))
      const wallGroups = state.data.wallGroups.map((g) => ({
        ...g,
        controllerAssignments: [],
      }))
      const powerLines = state.data.powerLines.map((pl) => ({
        ...pl,
        assignedPanels: [],
      }))
      return {
        ...state,
        ...undo,
        selectedPortSelection: null,
        selectedPowerLineId: null,
        data: { ...state.data, controllers, wallGroups, powerLines },
      }
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state
      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        data: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.data],
      }
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        ...state,
        data: next,
        undoStack: [...state.undoStack, state.data],
        redoStack: state.redoStack.slice(0, -1),
      }
    }

    default:
      return state
  }
}

interface BuilderContextValue {
  state: BuilderState
  dispatch: React.Dispatch<BuilderAction>
}

export const BuilderContext = createContext<BuilderContextValue | null>(null)

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}
