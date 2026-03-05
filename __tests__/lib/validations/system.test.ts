import { systemSchema } from '@/lib/validations/system'

describe('systemSchema', () => {
  it('validates a valid system', () => {
    const result = systemSchema.safeParse({
      name: 'Main AV System',
      slug: 'main-av-system',
    })
    expect(result.success).toBe(true)
  })

  it('validates with all optional fields', () => {
    const result = systemSchema.safeParse({
      name: 'Main AV System',
      slug: 'main-av-system',
      description: 'The main AV system',
      location: 'Building A',
      category: 'Conference',
      status: 'OPERATIONAL',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = systemSchema.safeParse({
      slug: 'test',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing slug', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('rejects slugs with uppercase letters', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'Bad-Slug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects slugs with spaces', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'bad slug',
    })
    expect(result.success).toBe(false)
  })

  it('rejects slugs with special characters', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'bad_slug!',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid slug with hyphens and numbers', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'room-101-av',
    })
    expect(result.success).toBe(true)
  })

  it('enforces name max length of 100', () => {
    const result = systemSchema.safeParse({
      name: 'a'.repeat(101),
      slug: 'test',
    })
    expect(result.success).toBe(false)
  })

  it('enforces description max length of 5000', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'test',
      description: 'a'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status enum', () => {
    const result = systemSchema.safeParse({
      name: 'Test',
      slug: 'test',
      status: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid status values', () => {
    const statuses = ['OPERATIONAL', 'DEGRADED', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN']
    for (const status of statuses) {
      const result = systemSchema.safeParse({
        name: 'Test',
        slug: 'test',
        status,
      })
      expect(result.success).toBe(true)
    }
  })
})
