'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { DeviceStatus } from '@prisma/client'

interface DeviceStatusContextValue {
  statusMap: Map<string, DeviceStatus>
  connected: boolean
}

const DeviceStatusContext = createContext<DeviceStatusContextValue>({
  statusMap: new Map(),
  connected: false,
})

export function DeviceStatusProvider({ children }: { children: React.ReactNode }) {
  const [statusMap, setStatusMap] = useState<Map<string, DeviceStatus>>(new Map())
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    function connect() {
      const es = new EventSource('/api/events/devices')
      esRef.current = es

      es.onopen = () => {
        setConnected(true)
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: 'snapshot' | 'update'
            devices: Array<{ id: string; status: DeviceStatus; lastSeenAt: string | null }>
          }
          setStatusMap((prev) => {
            const next = new Map(prev)
            for (const d of data.devices) {
              next.set(d.id, d.status)
            }
            return next
          })
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        esRef.current = null
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      esRef.current?.close()
    }
  }, [])

  return (
    <DeviceStatusContext.Provider value={{ statusMap, connected }}>
      {children}
    </DeviceStatusContext.Provider>
  )
}

export function useDeviceStatus() {
  return useContext(DeviceStatusContext)
}
