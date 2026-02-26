import { z } from 'zod'

export const deviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  ipAddress: z.string().max(45).optional().nullable(),
  macAddress: z.string().max(17).optional().nullable(),
  deviceType: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(100).optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  status: z.enum(['ONLINE', 'OFFLINE', 'WARNING', 'ERROR', 'UNKNOWN']).optional(),
  systemId: z.string().cuid(),
  snmpEnabled: z.boolean().optional(),
  snmpVersion: z.enum(['V1', 'V2C', 'V3']).optional().nullable(),
  snmpCommunity: z.string().max(100).optional().nullable(),
  snmpPort: z.number().int().min(1).max(65535).optional(),
})

export const deviceUpdateSchema = deviceSchema.partial()

export type DeviceInput = z.infer<typeof deviceSchema>
export type DeviceUpdateInput = z.infer<typeof deviceUpdateSchema>

export const deviceTypeOptions = [
  'Switcher',
  'Projector',
  'Display',
  'DSP',
  'Amplifier',
  'Microphone',
  'Camera',
  'Encoder',
  'Decoder',
  'Control Processor',
  'Touch Panel',
  'Network Switch',
  'Router',
  'Server',
  'Storage',
  'Other',
]
