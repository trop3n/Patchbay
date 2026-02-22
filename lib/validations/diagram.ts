import { z } from 'zod'

export const diagramSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(['SIGNAL_FLOW', 'WHITEBOARD', 'NETWORK', 'RACK_LAYOUT']),
  systemId: z.string().cuid().optional().nullable(),
  data: z.any(),
})

export type DiagramInput = z.infer<typeof diagramSchema>
