export type WiringPattern = 'S' | 'Z' | 'N'

export interface PortAssignment {
  controllerId: string
  portIndex: number
  panelIndices: number[]
}

export interface WallGroup {
  id: string
  name: string
  cols: number
  rows: number
  x: number
  y: number
  panelSpecId: string
  wiringPattern: WiringPattern
  controllerAssignments: PortAssignment[]
}

export interface ControllerPort {
  portIndex: number
  assignedPanels: { groupId: string; panelIndices: number[] }[]
}

export interface Controller {
  id: string
  processorSpecId: string
  name: string
  ports: ControllerPort[]
}

export interface PowerLine {
  id: string
  name: string
  maxAmps: number
  assignedPanels: { groupId: string; panelIndices: number[] }[]
}

export interface LedWallDataV2 {
  version: 2
  wallGroups: WallGroup[]
  controllers: Controller[]
  powerLines: PowerLine[]
  canvas: { offsetX: number; offsetY: number; zoom: number }
}

export interface PortSelection {
  controllerId: string
  portIndex: number
}

export function isV2Data(data: unknown): data is LedWallDataV2 {
  return typeof data === 'object' && data !== null && 'version' in data && (data as LedWallDataV2).version === 2
}

export function createEmptyV2Data(): LedWallDataV2 {
  return {
    version: 2,
    wallGroups: [],
    controllers: [],
    powerLines: [],
    canvas: { offsetX: 0, offsetY: 0, zoom: 1 },
  }
}

export const PORT_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-lime-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-red-500',
] as const

export const PORT_BORDER_COLORS = [
  'border-blue-500',
  'border-emerald-500',
  'border-amber-500',
  'border-rose-500',
  'border-violet-500',
  'border-cyan-500',
  'border-orange-500',
  'border-pink-500',
  'border-lime-500',
  'border-indigo-500',
  'border-teal-500',
  'border-red-500',
] as const

export function getPortColor(controllerId: string, portIndex: number, controllers: Controller[]): string {
  let globalIndex = 0
  for (const ctrl of controllers) {
    for (const port of ctrl.ports) {
      if (ctrl.id === controllerId && port.portIndex === portIndex) {
        return PORT_COLORS[globalIndex % PORT_COLORS.length]
      }
      globalIndex++
    }
  }
  return PORT_COLORS[0]
}

export function getPortBorderColor(controllerId: string, portIndex: number, controllers: Controller[]): string {
  let globalIndex = 0
  for (const ctrl of controllers) {
    for (const port of ctrl.ports) {
      if (ctrl.id === controllerId && port.portIndex === portIndex) {
        return PORT_BORDER_COLORS[globalIndex % PORT_BORDER_COLORS.length]
      }
      globalIndex++
    }
  }
  return PORT_BORDER_COLORS[0]
}
