import type { Role } from '@prisma/client'

export function canWrite(role: Role): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN'
}
