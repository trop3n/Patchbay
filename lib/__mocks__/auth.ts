import type { Role } from '@prisma/client'

interface MockSession {
  user: {
    id: string
    email: string
    name: string
    username: string
    role: Role
  }
}

let mockSession: MockSession | null = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    role: 'ADMIN',
  },
}

export function setMockSession(session: MockSession | null) {
  mockSession = session
}

export const auth = jest.fn(() => Promise.resolve(mockSession))
export const signIn = jest.fn()
export const signOut = jest.fn()
export const handlers = { GET: jest.fn(), POST: jest.fn() }
