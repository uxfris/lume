import { z } from "zod"
import { MeetingSchema, type Meeting } from "./meetings"

export const ChannelTypeSchema = z.enum(["PUBLIC", "PRIVATE"])
export type ChannelType = z.infer<typeof ChannelTypeSchema>

export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: ChannelTypeSchema,
  meetingCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Channel = z.infer<typeof ChannelSchema>

export const ChannelMeetingSchema = MeetingSchema
export type ChannelMeeting = Meeting
