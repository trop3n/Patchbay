import { cn, formatDistanceToNow } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('resolves Tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDistanceToNow', () => {
  it('returns "just now" for less than 60 seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(formatDistanceToNow(date)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('5 minutes ago')
  })

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('3 hours ago')
  })

  it('returns days ago', () => {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('7 days ago')
  })

  it('returns months ago', () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('3 months ago')
  })

  it('returns years ago', () => {
    const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
    expect(formatDistanceToNow(date)).toBe('1 years ago')
  })
})
