import { Prisma, prisma } from "@workspace/database"
import { handleCalendarSyncEvent } from "./recall-calendar-sync"
import { dispatchMeetingRecallEvent } from "./recall-handlers/dispatch-meeting-event"
import {
  extractBotId,
  extractEventType,
  extractInternalMeetingId,
} from "./recall-webhook-payload"
import type { RecallEventResult } from "./recall-webhook.types"

export type { RecallEventResult } from "./recall-webhook.types"
export { extractBotId, extractEventType } from "./recall-webhook-payload"

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

  // Calendar V2: `calendar.sync_events` => fetch changed events via API.
  if (eventType === "calendar.sync_events") {
    const handled = await handleCalendarSyncEvent(input.payload)
    return handled
      ? { ok: true, action: "CALENDAR_SYNCED" }
      : { ok: false, reason: "IGNORED" }
  }
  if (eventType === "calendar.update") {
    return { ok: true, action: "NOTED" }
  }

  const meeting = await findMeetingFromPayload(input.payload)
  if (!meeting) return { ok: false, reason: "MEETING_NOT_FOUND" }

  const result = await dispatchMeetingRecallEvent(eventType, {
    meeting,
    payload: input.payload,
    traceId: input.traceId,
  })
  if (result) return result
  return { ok: false, reason: "IGNORED" }
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
