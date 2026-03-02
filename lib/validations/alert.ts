import { z } from 'zod'

export const alertThresholdSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  condition: z.enum(['DEVICE_OFFLINE', 'DEVICE_ERROR', 'LOW_UPTIME', 'STATUS_CHANGE']),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  threshold: z.number().min(0).optional().nullable(),
  thresholdUnit: z.string().max(50).optional().nullable(),
  enabled: z.boolean(),
  notifyEmail: z.boolean(),
  notifyWebhook: z.boolean(),
  webhookUrl: z.string().url('Must be a valid URL').max(2000).optional().nullable(),
  emailRecipients: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true
        const emails = val.split(',').map((e) => e.trim())
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emails.every((e) => emailRegex.test(e))
      },
      { message: 'All email recipients must be valid email addresses' }
    ),
  systemId: z.string().cuid().optional().nullable(),
  deviceId: z.string().cuid().optional().nullable(),
})

export const alertThresholdUpdateSchema = alertThresholdSchema.partial()

export type AlertThresholdInput = z.infer<typeof alertThresholdSchema>
export type AlertThresholdUpdateInput = z.infer<typeof alertThresholdUpdateSchema>
