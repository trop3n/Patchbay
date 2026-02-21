import { type System, SystemStatus } from '@prisma/client'
import { type Diagram, DiagramType } from '@prisma/client'
import { type Asset, AssetStatus } from '@prisma/client'
import { type Document } from '@prisma/client'
import { type User, Role } from '@prisma/client'
import { type Device, DeviceStatus } from '@prisma/client'
import { type DeviceLog, LogLevel } from '@prisma/client'
import { type AuditLog } from '@prisma/client'

export type {
  System,
  Diagram,
  Asset,
  Document,
  User,
  Device,
  DeviceLog,
  AuditLog,
}

export { SystemStatus, DiagramType, AssetStatus, DeviceStatus, Role, LogLevel }

export type SystemWithRelations = System & {
  diagrams: Diagram[]
  documents: Document[]
  assets: Asset[]
  devices: Device[]
}

export type DiagramWithRelations = Diagram & {
  system?: System | null
  createdBy: User
}

export type AssetWithRelations = Asset & {
  system?: System | null
  createdBy: User
}

export type DocumentWithRelations = Document & {
  system?: System | null
  createdBy: User
}

export type AuthUser = {
  id: string
  email: string
  name?: string | null | undefined
  username: string
  role: Role
}
