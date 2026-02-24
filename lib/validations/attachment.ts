import { z } from 'zod'

export const attachmentSchema = z.object({
  systemId: z.string().cuid().optional().nullable(),
  documentId: z.string().cuid().optional().nullable(),
})

export type AttachmentInput = z.infer<typeof attachmentSchema>
