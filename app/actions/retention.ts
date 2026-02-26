'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getRetentionPolicy, runRetentionCleanup, getRetentionStats } from '@/lib/retention'

export async function getRetentionSettings() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return getRetentionPolicy()
}

export async function updateRetentionSettings(data: {
  deviceLogRetentionDays?: number
  statusHistoryRetentionDays?: number
  alertRetentionDays?: number
  resolvedAlertRetentionDays?: number
  enabled?: boolean
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const policy = await getRetentionPolicy()

    const updated = await prisma.retentionPolicy.update({
      where: { id: policy.id },
      data: {
        deviceLogRetentionDays: data.deviceLogRetentionDays,
        statusHistoryRetentionDays: data.statusHistoryRetentionDays,
        alertRetentionDays: data.alertRetentionDays,
        resolvedAlertRetentionDays: data.resolvedAlertRetentionDays,
        enabled: data.enabled,
      },
    })

    revalidatePath('/settings/retention')
    return { success: true, policy: updated }
  } catch (error) {
    console.error('Failed to update retention settings:', error)
    return { error: 'Failed to update retention settings' }
  }
}

export async function runCleanup() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  if (session.user.role !== 'ADMIN') {
    return { error: 'Insufficient permissions' }
  }

  try {
    const stats = await runRetentionCleanup()
    return { success: true, stats }
  } catch (error) {
    console.error('Failed to run cleanup:', error)
    return { error: 'Failed to run cleanup' }
  }
}

export async function getCleanupPreview() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  return getRetentionStats()
}
