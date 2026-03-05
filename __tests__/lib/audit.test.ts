jest.mock('@/lib/prisma')

import { sanitizeForAudit, createAuditLog } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

const mockCreate = prisma.auditLog.create as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('sanitizeForAudit', () => {
  it('redacts sensitive fields', () => {
    const data = {
      name: 'Test',
      password: 'secret123',
      hashedPassword: 'hash',
      snmpCommunity: 'public',
      webhookUrl: 'https://example.com',
      smtpPass: 'pass',
      secret: 'mysecret',
      token: 'mytoken',
      apiKey: 'mykey',
    }

    const result = sanitizeForAudit(data)

    expect(result.name).toBe('Test')
    expect(result.password).toBe('[REDACTED]')
    expect(result.hashedPassword).toBe('[REDACTED]')
    expect(result.snmpCommunity).toBe('[REDACTED]')
    expect(result.webhookUrl).toBe('[REDACTED]')
    expect(result.smtpPass).toBe('[REDACTED]')
    expect(result.secret).toBe('[REDACTED]')
    expect(result.token).toBe('[REDACTED]')
    expect(result.apiKey).toBe('[REDACTED]')
  })

  it('passes through non-sensitive fields unchanged', () => {
    const data = {
      name: 'Test System',
      slug: 'test-system',
      description: 'A test system',
      status: 'OPERATIONAL',
    }

    const result = sanitizeForAudit(data)
    expect(result).toEqual(data)
  })

  it('does not mutate the original object', () => {
    const data = { password: 'secret', name: 'test' }
    sanitizeForAudit(data)
    expect(data.password).toBe('secret')
  })
})

describe('createAuditLog', () => {
  it('calls prisma.auditLog.create with correct data', async () => {
    mockCreate.mockResolvedValue({ id: '1' })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'System',
      entityId: 'sys-1',
      userId: 'user-1',
      changes: {
        after: { name: 'New System' },
      },
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        action: 'CREATE',
        entityType: 'System',
        entityId: 'sys-1',
        userId: 'user-1',
        changes: {
          after: { name: 'New System' },
        },
      },
    })
  })

  it('handles errors gracefully without throwing', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockCreate.mockRejectedValue(new Error('DB error'))

    await expect(
      createAuditLog({
        action: 'CREATE',
        entityType: 'System',
        entityId: 'sys-1',
        userId: 'user-1',
      })
    ).resolves.not.toThrow()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to create audit log:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('passes undefined for changes when not provided', async () => {
    mockCreate.mockResolvedValue({ id: '1' })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'Device',
      entityId: 'dev-1',
      userId: 'user-1',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        action: 'DELETE',
        entityType: 'Device',
        entityId: 'dev-1',
        userId: 'user-1',
        changes: undefined,
      },
    })
  })
})
