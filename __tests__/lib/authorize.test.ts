import { canWrite, isAdmin } from '@/lib/authorize'
import type { Role } from '@prisma/client'

describe('canWrite', () => {
  it('returns true for ADMIN', () => {
    expect(canWrite('ADMIN')).toBe(true)
  })

  it('returns true for EDITOR', () => {
    expect(canWrite('EDITOR')).toBe(true)
  })

  it('returns false for VIEWER', () => {
    expect(canWrite('VIEWER')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for ADMIN', () => {
    expect(isAdmin('ADMIN')).toBe(true)
  })

  it('returns false for EDITOR', () => {
    expect(isAdmin('EDITOR')).toBe(false)
  })

  it('returns false for VIEWER', () => {
    expect(isAdmin('VIEWER')).toBe(false)
  })
})
