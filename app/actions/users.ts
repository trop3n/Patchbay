'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import type { Role } from '@prisma/client'

export async function getUsers() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }

  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  if (session.user.id === userId) {
    return { error: 'Cannot change your own role' }
  }

  try {
    const before = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, username: true, role: true },
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      userId: session.user.id,
      changes: { before: { role: before?.role }, after: { role } },
    })
    revalidatePath('/settings')
    return { success: true, user }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { error: 'Failed to update user role' }
  }
}

export async function toggleUserActive(userId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  if (session.user.id === userId) {
    return { error: 'Cannot deactivate yourself' }
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    })

    if (!currentUser) {
      return { error: 'User not found' }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentUser.isActive },
      select: { id: true, name: true, username: true, isActive: true },
    })
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      userId: session.user.id,
      changes: { before: { isActive: currentUser.isActive }, after: { isActive: !currentUser.isActive } },
    })
    revalidatePath('/settings')
    return { success: true, user }
  } catch (error) {
    console.error('Failed to toggle user active status:', error)
    return { error: 'Failed to update user status' }
  }
}

export async function createUser(data: { email: string; username: string; name?: string; password: string; role?: Role }) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  const { hash } = await import('bcryptjs')
  const hashedPassword = await hash(data.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'VIEWER',
      },
      select: { id: true, name: true, username: true, email: true, role: true },
    })
    await createAuditLog({
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      userId: session.user.id,
      changes: { after: { email: data.email, username: data.username, name: data.name, role: data.role || 'VIEWER' } },
    })
    revalidatePath('/settings')
    return { success: true, user }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { error: 'Failed to create user. Email or username may already exist.' }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  const { hash } = await import('bcryptjs')
  const hashedPassword = await hash(newPassword, 10)

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to reset password:', error)
    return { error: 'Failed to reset password' }
  }
}
