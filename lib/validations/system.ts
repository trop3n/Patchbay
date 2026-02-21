import { z } from 'zod'

export const systemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(5000).optional(),
  location: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  status: z.enum(['OPERATIONAL', 'DEGRADED', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN']).optional(),
})

export type SystemInput = z.infer<typeof systemSchema>
