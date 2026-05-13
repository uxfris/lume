import { z } from "zod"
import {
  ChannelMeetingSchema,
  ChannelSchema,
  ChannelTypeSchema,
} from "@workspace/types"

export const channelTypeSchema = ChannelTypeSchema

export const channelSchema = ChannelSchema

export const channelMeetingSchema = ChannelMeetingSchema

export const channelParamsSchema = z.object({
  id: z.string().min(1),
})

export const createChannelBodySchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  type: channelTypeSchema.optional().default("PUBLIC"),
})

export const patchChannelBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: z.string().max(1000).nullable().optional(),
    type: channelTypeSchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  })

export const listChannelMeetingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

export const updateChannelMeetingsBodySchema = z.object({
  meetingIds: z.array(z.string().min(1)).min(1).max(100),
})

export const removeChannelMeetingsBodySchema = z.object({
  meetingIds: z.array(z.string().min(1)).min(1).max(100),
})

export const listChannelsResponseSchema = z.object({
  channels: z.array(channelSchema),
})

export const createChannelResponseSchema = z.object({
  channel: channelSchema,
})

export const listChannelMeetingsResponseSchema = z.object({
  meetings: z.array(channelMeetingSchema),
})

export const updateChannelMeetingsResponseSchema = z.object({
  updatedCount: z.number().int().nonnegative(),
})

export const channelErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
