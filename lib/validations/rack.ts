import { z } from 'zod'

const rackUnitSchema = z.object({
  position: z.number().int().min(1),
  height: z.number().int().min(1).max(42),
  assetId: z.string().optional(),
  label: z.string().max(200).optional(),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
})

export const rackSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  location: z.string().max(200).optional(),
  height: z.number().int().min(1, 'Height must be at least 1U').max(50, 'Height cannot exceed 50U'),
  systemId: z.string().cuid().optional().nullable(),
  units: z.array(rackUnitSchema).optional(),
})

export const rackUpdateSchema = rackSchema.partial()

export type RackInput = z.infer<typeof rackSchema>
export type RackUpdateInput = z.infer<typeof rackUpdateSchema>
