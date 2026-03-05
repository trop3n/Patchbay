import { deviceSchema } from '@/lib/validations/device'

const validDevice = {
  name: 'Conference Room Projector',
  systemId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
}

describe('deviceSchema', () => {
  it('validates a minimal valid device', () => {
    const result = deviceSchema.safeParse(validDevice)
    expect(result.success).toBe(true)
  })

  it('validates with all fields', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      ipAddress: '192.168.1.100',
      macAddress: '00:11:22:33:44:55',
      deviceType: 'Projector',
      manufacturer: 'Epson',
      model: 'EB-L635SU',
      status: 'ONLINE',
      snmpEnabled: true,
      snmpVersion: 'V2C',
      snmpCommunity: 'public',
      snmpPort: 161,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = deviceSchema.safeParse({
      systemId: validDevice.systemId,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing systemId', () => {
    const result = deviceSchema.safeParse({
      name: 'Test Device',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid systemId (not cuid)', () => {
    const result = deviceSchema.safeParse({
      name: 'Test Device',
      systemId: 'not-a-cuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects SNMP port below 1', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      snmpPort: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects SNMP port above 65535', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      snmpPort: 65536,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid SNMP port range boundaries', () => {
    expect(deviceSchema.safeParse({ ...validDevice, snmpPort: 1 }).success).toBe(true)
    expect(deviceSchema.safeParse({ ...validDevice, snmpPort: 65535 }).success).toBe(true)
  })

  it('rejects non-integer SNMP port', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      snmpPort: 161.5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status enum', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      status: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid status values', () => {
    const statuses = ['ONLINE', 'OFFLINE', 'WARNING', 'ERROR', 'UNKNOWN']
    for (const status of statuses) {
      const result = deviceSchema.safeParse({ ...validDevice, status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid SNMP version', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      snmpVersion: 'V4',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid SNMP versions', () => {
    for (const snmpVersion of ['V1', 'V2C', 'V3']) {
      const result = deviceSchema.safeParse({ ...validDevice, snmpVersion })
      expect(result.success).toBe(true)
    }
  })

  it('enforces name max length of 200', () => {
    const result = deviceSchema.safeParse({
      ...validDevice,
      name: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })
})
