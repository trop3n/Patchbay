'use client'

import { useDeviceStatus } from '@/components/providers/device-status-provider'
import { deviceStatusColors, deviceStatusLabels } from '@/lib/device-status'
import type { DeviceStatus } from '@prisma/client'

export function LiveStatusIndicator() {
  const { connected } = useDeviceStatus()

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className={connected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
        {connected ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}

interface LiveDeviceStatusDotProps {
  deviceId: string
  initialStatus: DeviceStatus
}

export function LiveDeviceStatusDot({ deviceId, initialStatus }: LiveDeviceStatusDotProps) {
  const { statusMap } = useDeviceStatus()
  const status = statusMap.get(deviceId) ?? initialStatus

  return (
    <div
      className={`w-3 h-3 rounded-full ${deviceStatusColors[status]}`}
      title={deviceStatusLabels[status]}
    />
  )
}
