import { z } from "zod"

export const MeetingStatusSchema = z.enum(["analyzing", "processed"])
export type MeetingStatus = z.infer<typeof MeetingStatusSchema>

export const MeetingPlatformSchema = z.enum(["Google Meet", "Zoom", "Teams"])
export type MeetingPlatform = z.infer<typeof MeetingPlatformSchema>

export const AttendeeSchema = z.object({
  id: z.string(),
  avatarUrl: z.url().optional(),
  initials: z.string(),
})
export type Attendee = z.infer<typeof AttendeeSchema>

export const MeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  status: MeetingStatusSchema,
  timestamp: z.string(), // display string, e.g. "10:30" or "Oct 22, 2024"
  duration: z.string(), // e.g. "28m"
  attendees: z.array(AttendeeSchema),
  extraAttendees: z.number().optional(),
  /** Present when returned from meeting detail API (AI analysis). */
  keyPoints: z.array(z.string()).optional(),
})
export type Meeting = z.infer<typeof MeetingSchema>

export const UpcomingMeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  timestamp: z.string(), // display string, e.g. "10:30" or "Oct 22, 2024"
  duration: z.string(), // e.g. "28m"
  platform: MeetingPlatformSchema,
  action: z.enum(["join", "prepare"]),
  attendees: z.array(AttendeeSchema),
  extraAttendees: z.number().optional(),
})
export type UpcomingMeeting = z.infer<typeof UpcomingMeetingSchema>

export const UpcomingMeetingGroupSchema = z.object({
  label: z.string(),
  meetings: z.array(UpcomingMeetingSchema),
})
export type UpcomingMeetingGroup = z.infer<typeof UpcomingMeetingGroupSchema>

export const MeetingStatusEnum = z.enum([
  "PENDING_UPLOAD",
  "SCHEDULED",
  "UPLOADED",
  "TRANSCRIBING",
  "TRANSCRIBED",
  "ANALYZING",
  "SUMMARIZED",
  "FAILED",
])
