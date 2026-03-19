import { z } from 'zod'

export const systemBuildSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  systemId: z.string().cuid().optional().nullable(),
  data: z.any(),
})

export const systemBuildUpdateSchema = systemBuildSchema.partial()

export type SystemBuildInput = z.infer<typeof systemBuildSchema>
export type SystemBuildUpdateInput = z.infer<typeof systemBuildUpdateSchema>
