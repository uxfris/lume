import { prisma } from "@workspace/database"
import { extractStatusCode } from "../recall-webhook-payload"
import type { RecallEventResult } from "../recall-webhook.types"
import type { MeetingRecallContext } from "./context"

const TIMELINE_EVENT_TYPES = new Set([
  "bot.in_call_recording",
  "recording.processing",
  "recording.failed",
  "recording.deleted",
  "transcript.processing",
  "transcript.deleted",
  "bot.in_waiting_room",
  "bot.in_call_not_recording",
  "bot.joining_call",
  "bot.recording_permission_allowed",
  "bot.recording_permission_denied",
  "bot.call_ended",
  "bot.breakout_room_entered",
  "bot.breakout_room_left",
])

export function isTimelineStatusEvent(eventType: string): boolean {
  return TIMELINE_EVENT_TYPES.has(eventType)
}

/**
 * Surface status changes as ProcessingEvent rows so the UI can build a live
 * timeline without polling Recall.
 */
export async function handleTimelineStatus(
  ctx: MeetingRecallContext,
  eventType: string
): Promise<RecallEventResult> {
  const { meeting, payload } = ctx
  await prisma.processingEvent.create({
    data: {
      meetingId: meeting.id,
      stage: "TRANSCRIBE",
      status: "STARTED",
      message: eventType,
      metadata: {
        event: eventType,
        code: extractStatusCode(payload) ?? null,
      },
    },
  })
  return { ok: true, meetingId: meeting.id, action: "NOTED" }
}
