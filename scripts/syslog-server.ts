import dgram from 'dgram'
import net from 'net'
import { prisma } from '../lib/prisma'
import { parseSyslogMessage, getLogLevelFromSeverity } from '../lib/syslog/parser'
import { syslogConfig } from '../lib/syslog/config'
import { recordDeviceStatusChange } from '../lib/uptime'

interface DeviceCache {
  [ip: string]: string
}

const deviceCache: DeviceCache = {}

async function getDeviceIdByIp(ip: string): Promise<string | null> {
  if (deviceCache[ip]) {
    return deviceCache[ip]
  }

  try {
    const device = await prisma.device.findFirst({
      where: { ipAddress: ip },
      select: { id: true },
    })

    if (device) {
      deviceCache[ip] = device.id
      return device.id
    }
  } catch (error) {
    console.error(`[Syslog] Error looking up device ${ip}:`, error)
  }

  return null
}

async function storeLog(
  deviceId: string | null,
  sourceIp: string,
  parsed: ReturnType<typeof parseSyslogMessage>
) {
  try {
    const level = getLogLevelFromSeverity(parsed.severity)

    if (deviceId) {
      await prisma.deviceLog.create({
        data: {
          deviceId,
          level,
          message: parsed.message,
          source: `syslog:${sourceIp}`,
          rawLog: parsed.raw,
        },
      })

      if (level === 'ERROR' || level === 'CRITICAL') {
        await recordDeviceStatusChange(deviceId, 'ERROR', `syslog:${sourceIp}`)
      } else if (level === 'WARNING') {
        const device = await prisma.device.findUnique({
          where: { id: deviceId },
          select: { status: true },
        })
        if (device && device.status !== 'ERROR' && device.status !== 'OFFLINE') {
          await recordDeviceStatusChange(deviceId, 'WARNING', `syslog:${sourceIp}`)
        }
      } else {
        await recordDeviceStatusChange(deviceId, 'ONLINE', `syslog:${sourceIp}`)
      }
    }

    console.log(`[Syslog] ${sourceIp}${deviceId ? ` (${deviceId.slice(0, 8)}...)` : ''}: [${level}] ${parsed.message.slice(0, 100)}${parsed.message.length > 100 ? '...' : ''}`)
  } catch (error) {
    console.error('[Syslog] Error storing log:', error)
  }
}

async function handleMessage(raw: string, sourceIp: string) {
  const parsed = parseSyslogMessage(raw, sourceIp)
  const deviceId = await getDeviceIdByIp(sourceIp)
  await storeLog(deviceId, sourceIp, parsed)
}

function createUdpServer(config: typeof syslogConfig) {
  const server = dgram.createSocket('udp4')

  server.on('message', async (msg, rinfo) => {
    const raw = msg.toString('utf8')
    const sourceIp = rinfo.address
    await handleMessage(raw, sourceIp)
  })

  server.on('error', (err) => {
    console.error('[Syslog UDP] Server error:', err)
  })

  server.on('listening', () => {
    const address = server.address()
    console.log(`[Syslog UDP] Listening on ${address.address}:${address.port}`)
  })

  server.bind(config.udpPort, config.host)

  return server
}

function createTcpServer(config: typeof syslogConfig) {
  const server = net.createServer((socket) => {
    const clientIp = socket.remoteAddress || 'unknown'
    console.log(`[Syslog TCP] Connection from ${clientIp}`)

    let buffer = ''

    socket.on('data', async (data) => {
      buffer += data.toString('utf8')

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim()) {
          await handleMessage(line.trim(), clientIp)
        }
      }
    })

    socket.on('error', (err) => {
      console.error(`[Syslog TCP] Socket error from ${clientIp}:`, err.message)
    })

    socket.on('close', () => {
      if (buffer.trim()) {
        handleMessage(buffer.trim(), clientIp).catch(console.error)
      }
    })
  })

  server.on('error', (err) => {
    console.error('[Syslog TCP] Server error:', err)
  })

  server.listen(config.tcpPort, config.host, () => {
    console.log(`[Syslog TCP] Listening on ${config.host}:${config.tcpPort}`)
  })

  return server
}

async function main() {
  console.log('[Syslog] Starting syslog server...')
  console.log(`[Syslog] Config: UDP=${syslogConfig.enableUdp ? syslogConfig.udpPort : 'disabled'}, TCP=${syslogConfig.enableTcp ? syslogConfig.tcpPort : 'disabled'}`)

  const servers: { udp?: dgram.Socket; tcp?: net.Server } = {}

  if (syslogConfig.enableUdp) {
    servers.udp = createUdpServer(syslogConfig)
  }

  if (syslogConfig.enableTcp) {
    servers.tcp = createTcpServer(syslogConfig)
  }

  const shutdown = async () => {
    console.log('\n[Syslog] Shutting down...')
    if (servers.udp) servers.udp.close()
    if (servers.tcp) servers.tcp.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error('[Syslog] Fatal error:', error)
  process.exit(1)
})
