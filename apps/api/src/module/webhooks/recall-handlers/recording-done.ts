import { prisma } from "@workspace/database"
import { RecallApiError, createAsyncTranscriptForRecording } from "../../../lib/recall"
import { extractRecordingId } from "../recall-webhook-payload"
import type { RecallEventResult } from "../recall-webhook.types"
import type { MeetingRecallContext } from "./context"

export async function handleRecordingDone(
  ctx: MeetingRecallContext
): Promise<RecallEventResult> {
  const { meeting, payload } = ctx
  const eventType = "recording.done"

  if (meeting.status !== "SCHEDULED") {
    return { ok: false, reason: "ALREADY_PROCESSED" }
  }
  const recordingId = extractRecordingId(payload)
  if (!recordingId) return { ok: false, reason: "IGNORED" }

  try {
    const { transcriptId } = await createAsyncTranscriptForRecording({
      recordingId,
      meetingId: meeting.id,
    })

    await prisma.processingEvent.create({
      data: {
        meetingId: meeting.id,
        stage: "TRANSCRIBE",
        status: "STARTED",
        message: "requested Recall async transcript",
        metadata: {
          event: eventType,
          recordingId,
          transcriptId,
        },
      },
    })
  } catch (err) {
    // Webhook retries may attempt create_transcript multiple times; if the
    // transcript already exists or is already in progress, treat as
    // acknowledged and continue waiting for transcript.done.
    if (
      err instanceof RecallApiError &&
      (err.status === 409 || err.status === 400)
    ) {
      return { ok: true, meetingId: meeting.id, action: "NOTED" }
    }
    throw err
  }

  return { ok: true, meetingId: meeting.id, action: "NOTED" }
}
