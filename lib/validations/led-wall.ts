import { z } from 'zod'

export const ledWallSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(['VIDEO_WALL', 'STRIP_LAYOUT']),
  data: z.any(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  systemId: z.string().cuid().optional().nullable(),
})

export const ledWallUpdateSchema = ledWallSchema.partial()

export type LedWallInput = z.infer<typeof ledWallSchema>
export type LedWallUpdateInput = z.infer<typeof ledWallUpdateSchema>
