import snmp from 'net-snmp'
import { prisma } from '../lib/prisma'
import { snmpConfig, standardOids } from '../lib/snmp/config'
import type { SnmpPollResult, SnmpDeviceConfig } from '../lib/snmp/poller'
import { mapSnmpResultToStatus } from '../lib/snmp/poller'

function createSnmpSession(config: SnmpDeviceConfig): snmp.Session {
  const options: snmp.SessionOptions = {
    port: config.port,
    retries: snmpConfig.retries,
    timeout: config.timeout,
    version: config.version === '1' ? snmp.Version1 : snmp.Version2c,
  }

  return snmp.createSession(config.ipAddress, config.community, options)
}

async function pollDevice(device: {
  id: string
  name: string
  ipAddress: string | null
  snmpEnabled: boolean
  snmpVersion: 'V1' | 'V2C' | 'V3' | null
  snmpCommunity: string | null
  snmpPort: number
}): Promise<SnmpPollResult> {
  const result: SnmpPollResult = {
    success: false,
    polledAt: new Date(),
  }

  if (!device.ipAddress) {
    result.error = 'No IP address configured'
    return result
  }

  const config: SnmpDeviceConfig = {
    ipAddress: device.ipAddress,
    port: device.snmpPort || snmpConfig.defaultPort,
    community: device.snmpCommunity || snmpConfig.defaultCommunity,
    version: device.snmpVersion === 'V1' ? '1' : '2c',
    timeout: snmpConfig.timeout,
  }

  return new Promise((resolve) => {
    const session = createSnmpSession(config)
    const oids = [
      standardOids.sysDescr,
      standardOids.sysUpTime,
      standardOids.sysName,
      standardOids.sysContact,
      standardOids.sysLocation,
    ]

    session.get(oids, (error, varbinds) => {
      session.close()

      if (error) {
        result.error = error.message
        resolve(result)
        return
      }

      result.success = true

      if (varbinds) {
        for (const varbind of varbinds) {
          if (snmp.isVarbindError(varbind)) {
            continue
          }

          const oid = varbind.oid
          const value = varbind.value

          if (oid === standardOids.sysDescr) {
            result.sysDescr = String(value)
          } else if (oid === standardOids.sysUpTime) {
            result.sysUpTime = typeof value === 'number' ? value : parseInt(String(value), 10)
          } else if (oid === standardOids.sysName) {
            result.sysName = String(value)
          } else if (oid === standardOids.sysContact) {
            result.sysContact = String(value)
          } else if (oid === standardOids.sysLocation) {
            result.sysLocation = String(value)
          }
        }
      }

      resolve(result)
    })
  })
}

async function updateDeviceStatus(
  deviceId: string,
  result: SnmpPollResult
): Promise<void> {
  const status = mapSnmpResultToStatus(result)

  try {
    await prisma.device.update({
      where: { id: deviceId },
      data: {
        status,
        lastSeenAt: result.success ? new Date() : undefined,
        snmpLastPolled: new Date(),
      },
    })

    if (!result.success && result.error) {
      await prisma.deviceLog.create({
        data: {
          deviceId,
          level: 'WARNING',
          message: `SNMP poll failed: ${result.error}`,
          source: 'snmp-poller',
        },
      })
    } else if (result.success) {
      const info = [
        result.sysDescr && `Description: ${result.sysDescr}`,
        result.sysName && `Name: ${result.sysName}`,
        result.sysUpTime && `Uptime: ${Math.floor(result.sysUpTime / 100)}s`,
      ]
        .filter(Boolean)
        .join('; ')

      await prisma.deviceLog.create({
        data: {
          deviceId,
          level: 'INFO',
          message: `SNMP poll successful${info ? ` - ${info}` : ''}`,
          source: 'snmp-poller',
        },
      })
    }
  } catch (error) {
    console.error(`[SNMP] Error updating device ${deviceId}:`, error)
  }
}

async function pollAllDevices(): Promise<void> {
  console.log('[SNMP] Starting poll cycle...')

  const devices = await prisma.device.findMany({
    where: {
      snmpEnabled: true,
      ipAddress: { not: null },
    },
    select: {
      id: true,
      name: true,
      ipAddress: true,
      snmpEnabled: true,
      snmpVersion: true,
      snmpCommunity: true,
      snmpPort: true,
    },
  })

  console.log(`[SNMP] Found ${devices.length} devices to poll`)

  for (const device of devices) {
    console.log(`[SNMP] Polling ${device.name} (${device.ipAddress})...`)
    const result = await pollDevice(device)

    if (result.success) {
      console.log(`[SNMP] ${device.name}: OK - ${result.sysDescr?.slice(0, 50) || 'no description'}`)
    } else {
      console.log(`[SNMP] ${device.name}: FAILED - ${result.error}`)
    }

    await updateDeviceStatus(device.id, result)
  }

  console.log('[SNMP] Poll cycle complete')
}

async function main() {
  console.log('[SNMP] Starting SNMP poller...')
  console.log(`[SNMP] Poll interval: ${snmpConfig.pollIntervalMs}ms`)

  await pollAllDevices()

  const interval = setInterval(pollAllDevices, snmpConfig.pollIntervalMs)

  const shutdown = async () => {
    console.log('\n[SNMP] Shutting down...')
    clearInterval(interval)
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error('[SNMP] Fatal error:', error)
  process.exit(1)
})
