import { z } from "zod"
import { MeetingStatusEnum } from "./meetings"

/** Conferencing platform inferred from the join URL. */
export const BotPlatformEnum = z.enum([
  "ZOOM",
  "GOOGLE_MEET",
  "MICROSOFT_TEAMS",
  "OTHER",
])
export type BotPlatform = z.infer<typeof BotPlatformEnum>

const SUPPORTED_HOST_PATTERNS = [
  /(?:^|\.)zoom\.us$/i,
  /(?:^|\.)meet\.google\.com$/i,
  /(?:^|\.)teams\.microsoft\.com$/i,
  /(?:^|\.)teams\.live\.com$/i,
]

function isSupportedMeetingUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== "https:") return false
  return SUPPORTED_HOST_PATTERNS.some((p) => p.test(url.hostname))
}

export const StartBotMeetingBodySchema = z.object({
  meetingUrl: z.string().min(1).max(2048).refine(isSupportedMeetingUrl, {
    message:
      "Unsupported meeting URL. Supported: Zoom, Google Meet, Microsoft Teams.",
  }),
  /** Optional ISO 8601 timestamp for scheduled bots. */
  scheduledAt: z.iso.datetime().optional(),
  /** Optional override for the meeting title; defaults to the platform name. */
  title: z.string().min(1).max(200).optional(),
})
export type StartBotMeetingBody = z.infer<typeof StartBotMeetingBodySchema>

export const StartBotMeetingResponseSchema = z.object({
  meetingId: z.string(),
  status: MeetingStatusEnum,
  externalBotId: z.string(),
  platform: BotPlatformEnum,
})
export type StartBotMeetingResponse = z.infer<
  typeof StartBotMeetingResponseSchema
>
