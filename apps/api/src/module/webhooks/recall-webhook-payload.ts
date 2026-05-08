import type { RecallStatusEnvelope } from "./recall-webhook.types"

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
export function extractInternalMeetingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return (
    root.data?.bot?.metadata?.meeting_id ??
    root.data?.transcript?.metadata?.meeting_id ??
    root.data?.recording?.metadata?.meeting_id ??
    null
  )
}

export function extractTranscriptId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.transcript?.id ?? null
}

export function extractRecordingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.recording?.id ?? null
}

export function extractStatusCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as RecallStatusEnvelope
  return root.data?.data?.code ?? null
}
