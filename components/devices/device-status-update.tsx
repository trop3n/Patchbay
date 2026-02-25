'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateDeviceStatus } from '@/app/actions/devices'
import type { DeviceStatus } from '@prisma/client'

const statusOptions: { value: DeviceStatus; label: string }[] = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

interface DeviceStatusUpdateProps {
  deviceId: string
  currentStatus: DeviceStatus
}

export function DeviceStatusUpdate({ deviceId, currentStatus }: DeviceStatusUpdateProps) {
  const [status, setStatus] = useState<DeviceStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdate() {
    if (status === currentStatus) return

    setIsUpdating(true)
    const result = await updateDeviceStatus(deviceId, status)
    setIsUpdating(false)

    if (!result.success) {
      setStatus(currentStatus)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v) => setStatus(v as DeviceStatus)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={isUpdating || status === currentStatus}
      >
        {isUpdating ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  )
}
