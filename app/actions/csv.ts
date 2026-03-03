'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { systemSchema } from '@/lib/validations/system'
import { deviceSchema } from '@/lib/validations/device'
import { assetSchema } from '@/lib/validations/asset'
import { createAuditLog } from '@/lib/audit'
import { canWrite } from '@/lib/authorize'
import Papa from 'papaparse'

type ImportResult = { created: number; errors: string[] }

// ─── Import Actions ────────────────────────────────────────────────────────────

export async function importSystems(
  rows: Record<string, string>[]
): Promise<ImportResult> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) {
    return { created: 0, errors: ['Insufficient permissions'] }
  }

  let created = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    const parsed = systemSchema.safeParse({
      name: row.name?.trim() || undefined,
      slug: row.slug?.trim() || undefined,
      description: row.description?.trim() || undefined,
      location: row.location?.trim() || undefined,
      category: row.category?.trim() || undefined,
      status: row.status?.trim() || undefined,
    })

    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join(', ')
      errors.push(`Row ${rowNum}: ${msg}`)
      continue
    }

    try {
      await prisma.system.create({
        data: {
          ...parsed.data,
          createdById: session.user.id,
        },
      })
      created++
    } catch (error: unknown) {
      const err = error as { code?: string }
      if (err?.code === 'P2002') {
        errors.push(`Row ${rowNum}: slug "${parsed.data.slug}" already in use`)
      } else {
        errors.push(`Row ${rowNum}: failed to create system`)
      }
    }
  }

  if (created > 0) {
    await createAuditLog({
      action: 'CREATE',
      entityType: 'System',
      entityId: 'bulk-import',
      userId: session.user.id,
      changes: { after: { imported: created, failed: errors.length } },
    })
    revalidatePath('/systems')
  }

  return { created, errors }
}

export async function importDevices(
  rows: Record<string, string>[]
): Promise<ImportResult> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) {
    return { created: 0, errors: ['Insufficient permissions'] }
  }

  // Resolve all unique systemSlugs in one query
  const slugs = [...new Set(rows.map((r) => r.systemSlug?.trim()).filter(Boolean))]
  const systems = await prisma.system.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const slugToId = new Map(systems.map((s) => [s.slug, s.id]))

  let created = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    const systemSlug = row.systemSlug?.trim()
    if (!systemSlug) {
      errors.push(`Row ${rowNum}: systemSlug is required`)
      continue
    }

    const systemId = slugToId.get(systemSlug)
    if (!systemId) {
      errors.push(`Row ${rowNum}: unknown systemSlug "${systemSlug}"`)
      continue
    }

    const snmpPortRaw = row.snmpPort?.trim()
    const snmpPort = snmpPortRaw ? parseInt(snmpPortRaw, 10) : undefined

    const parsed = deviceSchema.safeParse({
      name: row.name?.trim() || undefined,
      systemId,
      ipAddress: row.ipAddress?.trim() || null,
      macAddress: row.macAddress?.trim() || null,
      deviceType: row.deviceType?.trim() || null,
      manufacturer: row.manufacturer?.trim() || null,
      model: row.model?.trim() || null,
      status: row.status?.trim() || undefined,
      snmpEnabled: row.snmpEnabled?.trim().toLowerCase() === 'true',
      snmpVersion: row.snmpVersion?.trim() || null,
      snmpCommunity: row.snmpCommunity?.trim() || null,
      snmpPort: snmpPortRaw ? (isNaN(snmpPort!) ? undefined : snmpPort) : undefined,
    })

    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join(', ')
      errors.push(`Row ${rowNum}: ${msg}`)
      continue
    }

    try {
      await prisma.device.create({
        data: {
          name: parsed.data.name,
          systemId: parsed.data.systemId,
          ipAddress: parsed.data.ipAddress || null,
          macAddress: parsed.data.macAddress || null,
          deviceType: parsed.data.deviceType || null,
          manufacturer: parsed.data.manufacturer || null,
          model: parsed.data.model || null,
          status: parsed.data.status || 'UNKNOWN',
          snmpEnabled: parsed.data.snmpEnabled ?? false,
          snmpVersion: parsed.data.snmpVersion || null,
          snmpCommunity: parsed.data.snmpCommunity || null,
          snmpPort: parsed.data.snmpPort ?? 161,
        },
      })
      created++
    } catch {
      errors.push(`Row ${rowNum}: failed to create device`)
    }
  }

  if (created > 0) {
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Device',
      entityId: 'bulk-import',
      userId: session.user.id,
      changes: { after: { imported: created, failed: errors.length } },
    })
    revalidatePath('/devices')
  }

  return { created, errors }
}

export async function importAssets(
  rows: Record<string, string>[]
): Promise<ImportResult> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!canWrite(session.user.role)) {
    return { created: 0, errors: ['Insufficient permissions'] }
  }

  // Resolve systemSlugs (optional for assets)
  const slugs = [...new Set(rows.map((r) => r.systemSlug?.trim()).filter(Boolean))]
  const slugToId = new Map<string, string>()
  if (slugs.length > 0) {
    const systems = await prisma.system.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    })
    for (const s of systems) slugToId.set(s.slug, s.id)
  }

  let created = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    let systemId: string | null = null
    const systemSlug = row.systemSlug?.trim()
    if (systemSlug) {
      const resolved = slugToId.get(systemSlug)
      if (!resolved) {
        errors.push(`Row ${rowNum}: unknown systemSlug "${systemSlug}"`)
        continue
      }
      systemId = resolved
    }

    const parsed = assetSchema.safeParse({
      name: row.name?.trim() || undefined,
      serialNumber: row.serialNumber?.trim() || undefined,
      manufacturer: row.manufacturer?.trim() || undefined,
      model: row.model?.trim() || undefined,
      purchaseDate: row.purchaseDate?.trim() || null,
      warrantyEnd: row.warrantyEnd?.trim() || null,
      location: row.location?.trim() || undefined,
      status: row.status?.trim() || undefined,
      notes: row.notes?.trim() || undefined,
      systemId: systemId || null,
    })

    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join(', ')
      errors.push(`Row ${rowNum}: ${msg}`)
      continue
    }

    try {
      await prisma.asset.create({
        data: {
          ...parsed.data,
          purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : undefined,
          warrantyEnd: parsed.data.warrantyEnd ? new Date(parsed.data.warrantyEnd) : undefined,
          createdById: session.user.id,
        },
      })
      created++
    } catch {
      errors.push(`Row ${rowNum}: failed to create asset`)
    }
  }

  if (created > 0) {
    await createAuditLog({
      action: 'CREATE',
      entityType: 'Asset',
      entityId: 'bulk-import',
      userId: session.user.id,
      changes: { after: { imported: created, failed: errors.length } },
    })
    revalidatePath('/assets')
  }

  return { created, errors }
}

// ─── Export Actions ────────────────────────────────────────────────────────────

export async function exportSystems(): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const systems = await prisma.system.findMany({
    orderBy: { name: 'asc' },
    select: {
      name: true,
      slug: true,
      description: true,
      location: true,
      category: true,
      status: true,
    },
  })

  return Papa.unparse(systems)
}

export async function exportDevices(): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const devices = await prisma.device.findMany({
    orderBy: { name: 'asc' },
    include: {
      system: { select: { slug: true } },
    },
  })

  const rows = devices.map((d) => ({
    name: d.name,
    systemSlug: d.system.slug,
    ipAddress: d.ipAddress ?? '',
    macAddress: d.macAddress ?? '',
    deviceType: d.deviceType ?? '',
    manufacturer: d.manufacturer ?? '',
    model: d.model ?? '',
    status: d.status,
    snmpEnabled: d.snmpEnabled ? 'true' : 'false',
    snmpVersion: d.snmpVersion ?? '',
    snmpCommunity: d.snmpCommunity ?? '',
    snmpPort: d.snmpPort != null ? String(d.snmpPort) : '',
  }))

  return Papa.unparse(rows)
}

export async function exportAssets(): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const assets = await prisma.asset.findMany({
    orderBy: { name: 'asc' },
    include: {
      system: { select: { slug: true } },
    },
  })

  const rows = assets.map((a) => ({
    name: a.name,
    serialNumber: a.serialNumber ?? '',
    manufacturer: a.manufacturer ?? '',
    model: a.model ?? '',
    purchaseDate: a.purchaseDate ? a.purchaseDate.toISOString().slice(0, 10) : '',
    warrantyEnd: a.warrantyEnd ? a.warrantyEnd.toISOString().slice(0, 10) : '',
    location: a.location ?? '',
    status: a.status,
    notes: a.notes ?? '',
    systemSlug: a.system?.slug ?? '',
  }))

  return Papa.unparse(rows)
}
