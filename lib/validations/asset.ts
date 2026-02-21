import { z } from 'zod'

export const assetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  serialNumber: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyEnd: z.coerce.date().optional().nullable(),
  location: z.string().max(200).optional(),
  status: z.enum(['ACTIVE', 'IN_STORAGE', 'IN_REPAIR', 'RETIRED', 'LOST']).optional(),
  notes: z.string().max(5000).optional(),
  systemId: z.string().cuid().optional().nullable(),
})

export type AssetInput = z.infer<typeof assetSchema>
