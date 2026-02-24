import { z } from 'zod'

export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().max(50000),
  contentType: z.enum(['RICH_TEXT', 'MARKDOWN', 'PLAIN_TEXT']).default('MARKDOWN'),
  systemId: z.string().cuid().optional().nullable(),
})

export type DocumentInput = z.infer<typeof documentSchema>
export type ContentTypeValue = 'RICH_TEXT' | 'MARKDOWN' | 'PLAIN_TEXT'
