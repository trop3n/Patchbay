import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { DeviceStatus } from '@prisma/client'

interface DeviceSnapshot {
  id: string
  status: DeviceStatus
  lastSeenAt: string | null
}

async function fetchDevices(): Promise<DeviceSnapshot[]> {
  const devices = await prisma.device.findMany({
    select: { id: true, status: true, lastSeenAt: true },
  })
  return devices.map((d) => ({
    id: d.id,
    status: d.status,
    lastSeenAt: d.lastSeenAt?.toISOString() ?? null,
  }))
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) => controller.enqueue(encoder.encode(data))

      // Send initial snapshot
      const initialDevices = await fetchDevices()
      const prevState = new Map<string, DeviceStatus>()
      for (const d of initialDevices) {
        prevState.set(d.id, d.status)
      }
      enqueue(`data: ${JSON.stringify({ type: 'snapshot', devices: initialDevices })}\n\n`)

      // Poll every 5 seconds for changes
      const interval = setInterval(async () => {
        try {
          const devices = await fetchDevices()
          const changed: DeviceSnapshot[] = []

          for (const d of devices) {
            if (prevState.get(d.id) !== d.status) {
              changed.push(d)
              prevState.set(d.id, d.status)
            }
          }

          if (changed.length > 0) {
            enqueue(`data: ${JSON.stringify({ type: 'update', devices: changed })}\n\n`)
          } else {
            enqueue(': heartbeat\n\n')
          }
        } catch {
          // Skip this cycle on DB error
        }
      }, 5000)

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
