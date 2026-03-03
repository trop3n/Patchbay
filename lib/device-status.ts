import type { DeviceStatus } from '@prisma/client'

export const deviceStatusColors: Record<DeviceStatus, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-orange-500',
  UNKNOWN: 'bg-gray-500',
}

export const deviceStatusLabels: Record<DeviceStatus, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  WARNING: 'Warning',
  ERROR: 'Error',
  UNKNOWN: 'Unknown',
}

export const deviceStatusBadgeVariants: Record<DeviceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ONLINE: 'default',
  OFFLINE: 'secondary',
  WARNING: 'outline',
  ERROR: 'destructive',
  UNKNOWN: 'outline',
}
