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
  let interval: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch {
          // Controller already closed, clean up
          if (interval) {
            clearInterval(interval)
            interval = null
          }
        }
      }

      const cleanup = () => {
        if (interval) {
          clearInterval(interval)
          interval = null
        }
        try {
          controller.close()
        } catch {
          // Already closed
        }
      }

      // Register abort handler before any async work to prevent leak on early disconnect
      request.signal.addEventListener('abort', cleanup)

      if (request.signal.aborted) {
        cleanup()
        return
      }

      try {
        // Send initial snapshot
        const initialDevices = await fetchDevices()
        const prevState = new Map<string, DeviceStatus>()
        for (const d of initialDevices) {
          prevState.set(d.id, d.status)
        }
        enqueue(`data: ${JSON.stringify({ type: 'snapshot', devices: initialDevices })}\n\n`)

        // Poll every 5 seconds for changes
        interval = setInterval(async () => {
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
      } catch {
        cleanup()
      }
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
