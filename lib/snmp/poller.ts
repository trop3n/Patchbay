import type { DeviceStatus } from '@prisma/client'

export interface SnmpPollResult {
  success: boolean
  sysDescr?: string
  sysUpTime?: number
  sysName?: string
  sysContact?: string
  sysLocation?: string
  error?: string
  polledAt: Date
}

export interface SnmpDeviceConfig {
  ipAddress: string
  port: number
  community: string
  version: '1' | '2c' | '3'
  timeout: number
}

export function mapSnmpResultToStatus(result: SnmpPollResult): DeviceStatus {
  if (!result.success) {
    return 'OFFLINE'
  }
  if (result.error) {
    return 'WARNING'
  }
  return 'ONLINE'
}

export function formatUptime(uptimeHundredths: number): string {
  const seconds = Math.floor(uptimeHundredths / 100)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
