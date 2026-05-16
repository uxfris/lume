import type { Meeting as MeetingDTO } from "@workspace/types"
import {
  extractBulletItemsAfterHeading,
  extractPlainTextFromDoc,
  parseMeetingSummary,
} from "@workspace/types"
import type {
  MeetingWithOwner,
  TranscriptSegmentWithParticipant,
} from "./meetings.repo"

function toTimestamp(totalMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase()
  const first = parts[0] ?? ""
  const last = parts[parts.length - 1] ?? ""
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return `${text.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`
}

function formatDurationSeconds(seconds: number | null): string {
  if (seconds == null || Number.isNaN(seconds)) return "—"
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

/** Display time or calendar date for meeting cards. */
export function formatMeetingTimestamp(createdAt: Date): string {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const startOfCreated = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth(),
    createdAt.getDate()
  )
  const sameDay = startOfCreated.getTime() === startOfToday.getTime()
  if (sameDay) {
    return createdAt.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  }
  return createdAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: createdAt.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

function uiStatus(status: MeetingWithOwner["status"]): MeetingDTO["status"] {
  return status === "SUMMARIZED"
    ? "processed"
    : status === "TRANSCRIBING"
      ? "transcribing"
      : status === "FAILED"
        ? "failed"
        : "analyzing"
}

const MAX_LIST_ATTENDEE_AVATARS = 4

function avatarUrlIfValid(image: string | null | undefined): string | undefined {
  if (!image || typeof image !== "string") return undefined
  const t = image.trim()
  if (t.startsWith("https://") || t.startsWith("http://")) return t
  return undefined
}

/** Card avatars: transcript participants, or meeting owner when none exist yet. */
function meetingAttendeesFromRow(row: MeetingWithOwner): MeetingDTO["attendees"] {
  if (row.meetingParticipants.length > 0) {
    return row.meetingParticipants.map((p) => {
      const label = (p.name ?? p.email ?? "").trim()
      const attendee: MeetingDTO["attendees"][number] = {
        id: p.id,
        initials: initialsFromName(label || "?"),
        isHost: p.isHost ?? null,
      }
      return attendee
    })
  }

  const ownerImage = avatarUrlIfValid(row.user.image)
  return [
    {
      id: row.user.id,
      initials: initialsFromName(row.user.name),
      isHost: true,
      ...(ownerImage ? { avatarUrl: ownerImage } : {}),
    },
  ]
}

/**
 * Group raw transcript segments into conversation messages (speaker runs).
 */
export function buildConversationMessages(
  meetingId: string,
  segments: TranscriptSegmentWithParticipant[]
): Array<{
  id: string
  timestampMs: number
  speaker: string
  sentences: Array<{
    id: string
    text: string
    startTimeMs: number
    endTimeMs: number
  }>
}> {
  const messages: Array<{
    id: string
    timestampMs: number
    speaker: string
    sentences: Array<{
      id: string
      text: string
      startTimeMs: number
      endTimeMs: number
    }>
  }> = []

  for (const segment of segments) {
    const speaker =
      segment.participant?.name ??
      (segment.participant?.externalId
        ? `Speaker ${segment.participant.externalId}`
        : "Speaker A")

    const sentence = {
      id: segment.id,
      text: segment.text,
      startTimeMs: segment.startMs,
      endTimeMs: segment.endMs,
      words:
        segment.transcriptWords.length > 0
          ? segment.transcriptWords.map((word) => ({
              id: word.id,
              text: word.text,
              startTimeMs: word.startMs,
              endTimeMs: word.endMs,
              position: word.position,
            }))
          : undefined,
    }

    const last = messages[messages.length - 1]

    if (!last || last.speaker !== speaker) {
      messages.push({
        id: `${meetingId}-${segment.index}`,
        timestampMs: segment.startMs,
        speaker,
        sentences: [sentence],
      })
      continue
    }

    last.sentences.push(sentence)
  }

  return messages
}

/** Wire-format conversation for API responses. */
export function toConversationResponse(
  meetingId: string,
  segments: TranscriptSegmentWithParticipant[]
) {
  return toConversationDTO({
    id: meetingId,
    messages: buildConversationMessages(meetingId, segments),
  })
}

export function toMeetingDTO(
  row: MeetingWithOwner,
  mode: "list" | "detail" = "list"
): MeetingDTO {
  const parsed = parseMeetingSummary(row.summary)
  const fullSummary = parsed
    ? extractPlainTextFromDoc(parsed.doc)
    : ""
  const summaryText =
    mode === "list"
      ? truncateText(fullSummary, 240) || "—"
      : truncateText(fullSummary, 12_000) || "—"

  const keyPoints =
    mode === "detail" && parsed
      ? extractBulletItemsAfterHeading(parsed.doc, "key takeaways")
      : undefined

  const allAttendees = meetingAttendeesFromRow(row)
  const total = allAttendees.length
  const capList =
    mode === "list" && total > MAX_LIST_ATTENDEE_AVATARS
  const attendees = capList
    ? allAttendees.slice(0, MAX_LIST_ATTENDEE_AVATARS)
    : allAttendees
  const extraAttendees =
    capList ? total - MAX_LIST_ATTENDEE_AVATARS : undefined

  return {
    id: row.id,
    title: row.title,
    isStarred: row.isStarred,
    summary: summaryText,
    status: uiStatus(row.status),
    channelId: row.channelId,
    timestamp: formatMeetingTimestamp(row.createdAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    duration: formatDurationSeconds(row.durationSeconds),
    durationSeconds: row.durationSeconds ?? null,
    source: row.source === "BOT" ? "bot" : "upload",
    attendees,
    ...(extraAttendees != null && extraAttendees > 0
      ? { extraAttendees }
      : {}),
    ...(keyPoints && keyPoints.length > 0 ? { keyPoints } : {}),
    ...(mode === "detail" && parsed?.doc ? { document: parsed.doc } : {}),
    ...(mode === "detail"
      ? {
          hostName:
            row.meetingParticipants.find((p) => p.isHost)?.name ??
            row.user.name,
        }
      : {}),
  }
}

export function toConversationDTO(conversation: {
  id: string
  messages: Array<{
    id: string
    timestampMs: number
    speaker: string
    sentences: Array<{
      id: string
      text: string
      startTimeMs: number
      endTimeMs: number
    }>
  }>
}) {
  return {
    id: conversation.id,
    messages: conversation.messages.map((m) => ({
      ...m,
      timestamp: toTimestamp(m.timestampMs),
    })),
  }
}
