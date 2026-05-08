import type { MeetingPlatform } from "@workspace/database"
import { env } from "../../config/env"
import {
  RecallApiError,
  RecallNotConfiguredError,
  detectPlatform,
  dispatchBot,
} from "../../lib/recall"
import { botsRepo } from "./bots.repo"

export type StartBotMeetingResult =
  | {
      ok: true
      meetingId: string
      status: "SCHEDULED"
      externalBotId: string
      platform: MeetingPlatform
    }
  | {
      ok: false
      error:
        | "RECALL_NOT_CONFIGURED"
        | "RECALL_DISPATCH_FAILED"
        | "UNSUPPORTED_PLATFORM"
      message?: string
    }

const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  ZOOM: "Zoom meeting",
  GOOGLE_MEET: "Google Meet meeting",
  MICROSOFT_TEAMS: "Microsoft Teams meeting",
  OTHER: "Online meeting",
}

function deriveBotMeetingTitle(input: {
  title?: string
  platform: MeetingPlatform
  scheduledAt?: Date
}): string {
  if (input.title?.trim()) return input.title.trim().slice(0, 200)
  const base = PLATFORM_LABELS[input.platform]
  if (input.scheduledAt) {
    return `${base} — ${input.scheduledAt.toISOString().slice(0, 16).replace("T", " ")}`
  }
  return base
}

/**
 * Persist a SCHEDULED meeting + dispatch a Recall bot. The meeting row is
 * created first so we have an id to send to Recall as `metadata.meeting_id`,
 * which is round-tripped on every webhook. If the Recall call fails we
 * delete the orphan row to avoid leaving a permanent SCHEDULED meeting.
 */
export async function startBotMeeting(input: {
  workspaceId: string
  userId: string
  meetingUrl: string
  scheduledAt?: string
  title?: string
}): Promise<StartBotMeetingResult> {
  const platform = detectPlatform(input.meetingUrl)
  if (platform === "OTHER") {
    return {
      ok: false,
      error: "UNSUPPORTED_PLATFORM",
      message:
        "Only Zoom, Google Meet, and Microsoft Teams URLs are supported.",
    }
  }

  const scheduledAt = input.scheduledAt
    ? new Date(input.scheduledAt)
    : undefined

  const meeting = await botsRepo.createScheduledMeeting({
    workspaceId: input.workspaceId,
    userId: input.userId,
    title: deriveBotMeetingTitle({
      title: input.title,
      platform,
      scheduledAt,
    }),
    meetingUrl: input.meetingUrl,
    platform,
    scheduledAt,
  })

  try {
    const dispatch = await dispatchBot({
      meetingUrl: input.meetingUrl,
      meetingId: meeting.id,
      joinAt: input.scheduledAt,
      realtimeWebhookUrl: env.RECALL_REALTIME_WEBHOOK_URL,
    })

    await botsRepo.attachExternalBotId(meeting.id, dispatch.botId)

    return {
      ok: true,
      meetingId: meeting.id,
      status: "SCHEDULED",
      externalBotId: dispatch.botId,
      platform,
    }
  } catch (err) {
    await botsRepo.deleteMeeting(meeting.id).catch(() => {})

    if (err instanceof RecallNotConfiguredError) {
      return { ok: false, error: "RECALL_NOT_CONFIGURED", message: err.message }
    }
    if (err instanceof RecallApiError) {
      return {
        ok: false,
        error: "RECALL_DISPATCH_FAILED",
        message: err.message,
      }
    }
    throw err
  }
}
