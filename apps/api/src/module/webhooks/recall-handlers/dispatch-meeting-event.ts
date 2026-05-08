import type { RecallEventResult } from "../recall-webhook.types"
import type { MeetingRecallContext } from "./context"
import { handleTranscriptFailedOrBotFatal } from "./fatal"
import { handleRecordingDone } from "./recording-done"
import { handleTimelineStatus, isTimelineStatusEvent } from "./timeline-status"
import { handleTranscriptDone } from "./transcript-done"

export async function dispatchMeetingRecallEvent(
  eventType: string,
  ctx: MeetingRecallContext
): Promise<RecallEventResult | null> {
  switch (eventType) {
    case "recording.done":
      return handleRecordingDone(ctx)
    case "transcript.done":
      return handleTranscriptDone(ctx)
    case "transcript.failed":
      return handleTranscriptFailedOrBotFatal(ctx, "transcript.failed")
    case "bot.fatal":
      return handleTranscriptFailedOrBotFatal(ctx, "bot.fatal")
    case "bot.done":
      // `bot.done` arrives alongside `transcript.done` and is a no-op for us
      // — we react to `transcript.done` so we have the transcript artifact
      // ready before we try to fetch it.
      return { ok: true, meetingId: ctx.meeting.id, action: "NOTED" }
    default:
      if (isTimelineStatusEvent(eventType)) {
        return handleTimelineStatus(ctx, eventType)
      }
      return null
  }
}
