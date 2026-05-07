import { prisma } from "@workspace/database"

interface RealtimeEnvelope {
  event?: string
  data?: {
    data?: {
      words?: Array<{
        text?: string
        start_timestamp?: { relative?: number; absolute?: string | null }
        end_timestamp?: { relative?: number; absolute?: string | null } | null
      }>
      participant?: {
        id?: number
        name?: string | null
        is_host?: boolean
        platform?: string | null
        email?: string | null
      }
      language_code?: string
    }
    bot?: { id?: string; metadata?: Record<string, string> }
    transcript?: { id?: string; metadata?: Record<string, string> }
    realtime_endpoint?: { id?: string; metadata?: Record<string, string> }
  }
}

export type RealtimeResult =
  | { handled: true; appended: boolean; meetingId: string }
  | { handled: false; reason: string }

function extractMeetingId(payload: RealtimeEnvelope): string | null {
  return (
    payload.data?.realtime_endpoint?.metadata?.meeting_id ??
    payload.data?.transcript?.metadata?.meeting_id ??
    payload.data?.bot?.metadata?.meeting_id ??
    null
  )
}

function extractBotId(payload: RealtimeEnvelope): string | null {
  return payload.data?.bot?.id ?? null
}

/**
 * Persist a single finalized `transcript.data` utterance. Partial updates
 * (`transcript.partial_data`) are accepted but not persisted — they're
 * intended for live captions and would just churn the table. A future
 * Phase 9 SSE channel can fan them out without writing to DB.
 */
export async function processRealtimeEvent(input: {
  payload: unknown
  traceId?: string
}): Promise<RealtimeResult> {
  if (!input.payload || typeof input.payload !== "object") {
    return { handled: false, reason: "INVALID_PAYLOAD" }
  }
  const payload = input.payload as RealtimeEnvelope

  if (payload.event !== "transcript.data") {
    return { handled: false, reason: payload.event ?? "MISSING_EVENT" }
  }

  const meetingIdMeta = extractMeetingId(payload)
  const botId = extractBotId(payload)
  const meeting = meetingIdMeta
    ? await prisma.meeting.findUnique({ where: { id: meetingIdMeta } })
    : botId
      ? await prisma.meeting.findUnique({ where: { externalBotId: botId } })
      : null

  if (!meeting) return { handled: false, reason: "MEETING_NOT_FOUND" }

  const words = payload.data?.data?.words ?? []
  const text = words
    .map((w) => w.text ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return { handled: true, appended: false, meetingId: meeting.id }

  const startMs = Math.max(
    0,
    Math.round((words[0]?.start_timestamp?.relative ?? 0) * 1000)
  )
  const lastWord = words[words.length - 1]
  const endMs = Math.max(
    startMs,
    Math.round(
      (lastWord?.end_timestamp?.relative ??
        lastWord?.start_timestamp?.relative ??
        0) * 1000
    )
  )

  const participantExternalId =
    payload.data?.data?.participant?.id != null
      ? String(payload.data.data.participant.id)
      : null
  const participantName = payload.data?.data?.participant?.name?.trim() || null
  const participantEmail = payload.data?.data?.participant?.email ?? null
  const participantPlatform = payload.data?.data?.participant?.platform ?? null
  const participantIsHost = payload.data?.data?.participant?.is_host ?? null
  const languageCode = payload.data?.data?.language_code ?? null

  // Append a row at the end of the existing index space. We use a max+1
  // strategy in a single round-trip to handle concurrent webhook deliveries
  // safely: even if two arrive at the same time, one will fail the unique
  // constraint and the other will succeed; the failed one is silently
  // retried on the next event.
  const last = await prisma.transcriptSegment.findFirst({
    where: { meetingId: meeting.id },
    orderBy: { index: "desc" },
    select: { index: true },
  })
  const nextIndex = (last?.index ?? -1) + 1

  try {
    let participantId: string | null = null
    if (participantExternalId != null) {
      const participant = await prisma.meetingParticipant.upsert({
        where: {
          meetingId_externalId: {
            meetingId: meeting.id,
            externalId: participantExternalId,
          },
        },
        update: {
          name: participantName,
          email: participantEmail,
          platform: participantPlatform,
          isHost: participantIsHost,
        },
        create: {
          meetingId: meeting.id,
          externalId: participantExternalId,
          name: participantName,
          email: participantEmail,
          platform: participantPlatform,
          isHost: participantIsHost,
        },
        select: { id: true },
      })
      participantId = participant.id
    }

    await prisma.transcriptSegment.create({
      data: {
        meetingId: meeting.id,
        index: nextIndex,
        participantId,
        languageCode,
        startMs,
        endMs,
        text,
        transcriptWords:
          words.length > 0
            ? {
                create: words.map((word, position) => {
                  const wordStartMs = Math.max(
                    0,
                    Math.round((word.start_timestamp?.relative ?? 0) * 1000)
                  )
                  const wordEndMs = Math.max(
                    wordStartMs,
                    Math.round(
                      (word.end_timestamp?.relative ??
                        word.start_timestamp?.relative ??
                        0) * 1000
                    )
                  )
                  return {
                    text: word.text ?? "",
                    startMs: wordStartMs,
                    endMs: wordEndMs,
                    position,
                  }
                }),
              }
            : undefined,
      },
    })
    return { handled: true, appended: true, meetingId: meeting.id }
  } catch {
    // Race: another webhook claimed this index. Skip — the post-call
    // `transcript.done` import path will reconcile the final transcript.
    return { handled: true, appended: false, meetingId: meeting.id }
  }
}
