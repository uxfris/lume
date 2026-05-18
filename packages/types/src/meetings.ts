import { z } from "zod"
import type { TiptapJSONContent } from "./meeting-analysis"

/** Loose validation for Tiptap/ProseMirror JSON from the editor. */
export const TiptapJSONContentSchema: z.ZodType<TiptapJSONContent> = z.lazy(
  () =>
    z.object({
      type: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      text: z.string().optional(),
      content: z.array(TiptapJSONContentSchema).optional(),
      marks: z
        .array(
          z.object({
            type: z.string(),
            attrs: z.record(z.string(), z.unknown()).optional(),
          })
        )
        .optional(),
    })
)

export const MeetingStatusSchema = z.enum([
  "transcribing",
  "analyzing",
  "processed",
  "failed",
])
export type MeetingStatus = z.infer<typeof MeetingStatusSchema>

export const MeetingPlatformSchema = z.enum(["Google Meet", "Zoom", "Teams"])
export type MeetingPlatform = z.infer<typeof MeetingPlatformSchema>

/** How the meeting was captured — mirrors DB `MeetingSource`. */
export const MeetingCaptureSourceSchema = z.enum(["upload", "bot"])
export type MeetingCaptureSource = z.infer<typeof MeetingCaptureSourceSchema>

export const AttendeeSchema = z.object({
  id: z.string(),
  avatarUrl: z.url().optional(),
  initials: z.string(),
  isHost: z.boolean().nullable().default(false),
})
export type Attendee = z.infer<typeof AttendeeSchema>

export const LiveMeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  timestamp: z.string(),
  meetingUrl: z.url().nullable(),
})
export type LiveMeeting = z.infer<typeof LiveMeetingSchema>

export const MeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  isStarred: z.boolean(),
  summary: z.string(),
  status: MeetingStatusSchema,
  timestamp: z.string(), // display string, e.g. "10:30" or "Oct 22, 2024"
  /** ISO 8601 — used for list filtering (sort/display still use `timestamp`). */
  createdAt: z.string(),
  /** ISO 8601 — last update time (notes, metadata, etc.). */
  updatedAt: z.string(),
  /** Meeting owner / host display name (detail API). */
  hostName: z.string().optional(),
  duration: z.string(), // e.g. "28m"
  /** Raw duration for filtering; list cards still show `duration`. */
  durationSeconds: z.number().nullable(),
  source: MeetingCaptureSourceSchema,
  attendees: z.array(AttendeeSchema),
  extraAttendees: z.number().optional(),
  /** Present when returned from meeting detail API (AI analysis). */
  keyPoints: z.array(z.string()).optional(),
  /** Tiptap document (v2 analysis) for the meeting editor. Detail API only. */
  document: z.custom<TiptapJSONContent>().optional(),
  channelId: z.string().nullable(),
})

export type Meeting = z.infer<typeof MeetingSchema>

export const UpcomingMeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  timestamp: z.string(), // display string, e.g. "10:30" or "Oct 22, 2024"
  duration: z.string(), // e.g. "28m"
  platform: MeetingPlatformSchema,
  action: z.enum(["join", "view event"]),
  calendarUrl: z.string(),
  meetingUrl: z.string().nullable(),
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
  "LIVE",
  "UPLOADED",
  "TRANSCRIBING",
  "TRANSCRIBED",
  "ANALYZING",
  "SUMMARIZED",
  "FAILED",
])

export type ListMeetingsResponse = {
  meetings: Meeting[]
  nextCursor: string | null
}
