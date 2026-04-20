import { z } from 'zod'

const MAX_NODES = 500
const MAX_EDGES = 1000
const MAX_ID_LENGTH = 200
const MAX_LABEL_LENGTH = 200
const MAX_SPEC_LENGTH = 100
const MAX_SPECS_PER_NODE = 20
const MAX_TYPE_LENGTH = 50
const MAX_COLOR_LENGTH = 32

const positionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})

const nodeDataSchema = z
  .object({
    hardwareTypeId: z.string().max(MAX_ID_LENGTH).optional(),
    label: z.string().max(MAX_LABEL_LENGTH).optional(),
    model: z.string().max(MAX_LABEL_LENGTH).optional(),
    specs: z.array(z.string().max(MAX_SPEC_LENGTH)).max(MAX_SPECS_PER_NODE).optional(),
  })
  .passthrough()

const nodeSchema = z
  .object({
    id: z.string().min(1).max(MAX_ID_LENGTH),
    type: z.string().max(MAX_TYPE_LENGTH).optional(),
    position: positionSchema,
    data: nodeDataSchema.optional(),
  })
  .passthrough()

const edgeDataSchema = z
  .object({
    color: z.string().max(MAX_COLOR_LENGTH).optional(),
  })
  .passthrough()

const edgeSchema = z
  .object({
    id: z.string().min(1).max(MAX_ID_LENGTH),
    source: z.string().min(1).max(MAX_ID_LENGTH),
    target: z.string().min(1).max(MAX_ID_LENGTH),
    sourceHandle: z.string().max(MAX_ID_LENGTH).nullable().optional(),
    targetHandle: z.string().max(MAX_ID_LENGTH).nullable().optional(),
    type: z.string().max(MAX_TYPE_LENGTH).optional(),
    data: edgeDataSchema.optional(),
  })
  .passthrough()

export const systemBuildDataSchema = z.object({
  nodes: z.array(nodeSchema).max(MAX_NODES, `Maximum ${MAX_NODES} nodes per build`).default([]),
  edges: z.array(edgeSchema).max(MAX_EDGES, `Maximum ${MAX_EDGES} edges per build`).default([]),
})

export const systemBuildSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  systemId: z.string().cuid().optional().nullable(),
  data: systemBuildDataSchema.optional(),
})

export const systemBuildUpdateSchema = systemBuildSchema.partial()

export type SystemBuildInput = z.infer<typeof systemBuildSchema>
export type SystemBuildUpdateInput = z.infer<typeof systemBuildUpdateSchema>
export type SystemBuildData = z.infer<typeof systemBuildDataSchema>
