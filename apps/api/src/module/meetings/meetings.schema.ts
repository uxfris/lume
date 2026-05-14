import { z } from "zod"
import {
  ConversationSchema,
  LiveMeetingSchema,
  MeetingSchema,
} from "@workspace/types"

export const getConversationParamsSchema = z.object({
  id: z.string().min(1),
})

export const listMeetingsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isStarred: z.coerce.boolean().optional(),
  isCreatedByMe: z.coerce.boolean().optional(),
  isSharedWithMe: z.coerce.boolean().optional(),
})

export const listLiveMeetingsResponseSchema = z.object({
  meetings: z.array(LiveMeetingSchema),
})
export const listMeetingsResponseSchema = z.object({
  meetings: z.array(MeetingSchema),
  nextCursor: z.string().nullable(),
})

export const getMeetingParamsSchema = z.object({
  id: z.string().min(1),
})

export const patchMeetingParamsSchema = z.object({
  id: z.string().min(1),
})

export const patchMeetingBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isShared: z.boolean().optional(),
  isStarred: z.boolean().optional(),
})

export const meetingSchema = MeetingSchema

export const meetingErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})

export const getConversationResponseSchema = ConversationSchema

export const deleteMeetingsBodySchema = z.object({
  meetingIds: z.array(z.string().min(1)).min(1).max(100),
})

export const moveMeetingsToWorkspaceBodySchema = z.object({
  targetWorkspaceId: z.string().min(1),
  meetingIds: z.array(z.string().min(1)).min(1).max(100),
})
