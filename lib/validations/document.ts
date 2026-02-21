import { z } from 'zod'

export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().max(50000),
  systemId: z.string().cuid().optional().nullable(),
})

export type DocumentInput = z.infer<typeof documentSchema>
