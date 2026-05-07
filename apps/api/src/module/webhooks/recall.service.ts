import { Prisma, prisma } from "@workspace/database"
import { QueueName, getQueue } from "@workspace/queue"
import {
  RecallApiError,
  createAsyncTranscriptForRecording,
} from "../../lib/recall"

export type RecallEventResult =
  | {
      ok: true
      meetingId: string
      action: "TRANSCRIPT_IMPORTED" | "FAILED" | "NOTED"
    }
  | { ok: false; reason: "MEETING_NOT_FOUND" | "ALREADY_PROCESSED" | "IGNORED" }

interface RecallStatusEnvelope {
  event?: string
  data?: {
    data?: {
      code?: string
      sub_code?: string | null
      updated_at?: string
    }
    bot?: { id?: string; metadata?: Record<string, string> }
    transcript?: { id?: string; metadata?: Record<string, string> }
    recording?: { id?: string; metadata?: Record<string, string> }
  }
}

export function extractEventType(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.event ?? null
}

/**
 * Recover the bot id from anywhere it may appear in the payload. Newer
 * `bot.*` and `transcript.*` events both carry `data.bot.id`.
 */
export function extractBotId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.bot?.id ?? null
}

/**
 * Recover our internal meeting id from the `metadata` Recall echoes back.
 * Falls back to looking up by externalBotId when metadata isn't present
 * (e.g. on bot.* events from before we attached it).
 */
function extractInternalMeetingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return (
    root.data?.bot?.metadata?.meeting_id ??
    root.data?.transcript?.metadata?.meeting_id ??
    root.data?.recording?.metadata?.meeting_id ??
    null
  )
}

function extractTranscriptId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.transcript?.id ?? null
}

function extractRecordingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.recording?.id ?? null
}

function extractStatusCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.data?.code ?? null
}

/**
 * Locate our `Meeting` row from a Recall webhook envelope. Prefers the
 * round-tripped `metadata.meeting_id` (cheap point lookup), falls back to
 * the unique `externalBotId` index.
 */
async function findMeetingFromPayload(payload: unknown) {
  const internalId = extractInternalMeetingId(payload)
  if (internalId) {
    const byId = await prisma.meeting.findUnique({ where: { id: internalId } })
    if (byId) return byId
  }
  const botId = extractBotId(payload)
  if (botId) {
    return prisma.meeting.findUnique({ where: { externalBotId: botId } })
  }
  return null
}

/**
 * Process a verified Recall webhook event. Idempotent: replaying the same
 * `transcript.done` for an already-imported meeting is a no-op.
 */
export async function processRecallEvent(input: {
  payload: unknown
  traceId?: string
}): Promise<RecallEventResult> {
  const eventType = extractEventType(input.payload)
  if (!eventType) return { ok: false, reason: "IGNORED" }

  const meeting = await findMeetingFromPayload(input.payload)
  if (!meeting) return { ok: false, reason: "MEETING_NOT_FOUND" }

  switch (eventType) {
    case "recording.done": {
      if (meeting.status !== "SCHEDULED") {
        return { ok: false, reason: "ALREADY_PROCESSED" }
      }
      const recordingId = extractRecordingId(input.payload)
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

    case "transcript.done": {
      // Idempotent: only run once per meeting.
      if (meeting.status !== "SCHEDULED") {
        return { ok: false, reason: "ALREADY_PROCESSED" }
      }
      if (!meeting.externalBotId) {
        // Backfill in case the user hit /meetings/bot before the dispatch
        // completed (unlikely race) — `data.bot.id` is the source of truth.
        const botId = extractBotId(input.payload)
        if (botId) {
          await prisma.meeting.update({
            where: { id: meeting.id },
            data: { externalBotId: botId },
          })
        }
      }

      const transcriptId = extractTranscriptId(input.payload)
      const externalBotId =
        meeting.externalBotId ?? extractBotId(input.payload) ?? ""

      await getQueue(QueueName.ImportBotTranscript).add(
        "import-bot-transcript",
        {
          meetingId: meeting.id,
          workspaceId: meeting.workspaceId,
          userId: meeting.userId,
          externalBotId,
          ...(transcriptId ? { transcriptId } : {}),
          traceId: input.traceId,
        },
        { jobId: `import-bot-transcript-${meeting.id}` }
      )
      return { ok: true, meetingId: meeting.id, action: "TRANSCRIPT_IMPORTED" }
    }

    case "transcript.failed":
    case "bot.fatal": {
      const subCode = extractStatusCode(input.payload)
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: "FAILED" },
      })
      await prisma.processingEvent.create({
        data: {
          meetingId: meeting.id,
          stage: "TRANSCRIBE",
          status: "FAILED",
          message: `Recall reported ${eventType}`,
          metadata: { event: eventType, code: subCode ?? null },
        },
      })
      return { ok: true, meetingId: meeting.id, action: "FAILED" }
    }

    case "bot.done": {
      // `bot.done` arrives alongside `transcript.done` and is a no-op for us
      // — we react to `transcript.done` so we have the transcript artifact
      // ready before we try to fetch it.
      return { ok: true, meetingId: meeting.id, action: "NOTED" }
    }

    case "bot.in_call_recording":
    case "recording.processing":
    case "recording.failed":
    case "recording.deleted":
    case "transcript.processing":
    case "transcript.deleted":
    case "bot.in_waiting_room":
    case "bot.in_call_not_recording":
    case "bot.joining_call":
    case "bot.recording_permission_allowed":
    case "bot.recording_permission_denied":
    case "bot.call_ended":
    case "bot.breakout_room_entered":
    case "bot.breakout_room_left": {
      // Surface all status changes as ProcessingEvent rows so the UI can
      // build a live timeline without polling Recall.
      await prisma.processingEvent.create({
        data: {
          meetingId: meeting.id,
          stage: "TRANSCRIBE",
          status: "STARTED",
          message: eventType,
          metadata: {
            event: eventType,
            code: extractStatusCode(input.payload) ?? null,
          },
        },
      })
      return { ok: true, meetingId: meeting.id, action: "NOTED" }
    }

    default:
      return { ok: false, reason: "IGNORED" }
  }
}

/** Persist a failed webhook for manual replay once retries are exhausted. */
export async function recordFailedRecallWebhook(input: {
  payload: unknown
  error: string
  externalBotId?: string | null
  eventType?: string | null
}) {
  await prisma.failedWebhook.create({
    data: {
      provider: "recall",
      eventType: input.eventType ?? null,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      error: input.error,
      externalBotId: input.externalBotId ?? null,
    },
  })
}
