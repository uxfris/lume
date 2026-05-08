import { z } from "zod"
import { UpcomingMeetingGroupSchema } from "@workspace/types"

export const listUpcomingQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(30).default(7),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const listUpcomingResponseSchema = z.array(UpcomingMeetingGroupSchema)

export const connectCalendarBodySchema = z.object({
  provider: z.enum(["google", "microsoft"]),
})

export const connectCalendarResponseSchema = z.object({
  calendarId: z.string(),
  provider: z.enum(["google", "microsoft"]),
  status: z.string(),
})

export const calendarErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
