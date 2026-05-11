import type { Prisma } from "@workspace/database"
import type { Conversation, Meeting as MeetingDTO } from "@workspace/types"
import {
  decodeMeetingListCursor,
  encodeMeetingListCursor,
} from "./meetings.cursor"
import { meetingsRepo } from "./meetings.repo"
import {
  formatMeetingTimestamp,
  toConversationResponse,
  toMeetingDTO,
} from "./meetings.presenter"

function clampPageSize(limit: number): number {
  return Math.min(Math.max(limit, 1), 100)
}

export async function listLiveMeetings(input: { workspaceId: string }) {
  const result = await meetingsRepo.listLiveByWorkspace({
    workspaceId: input.workspaceId,
  })
  return {
    meetings: result.map((item) => ({
      id: item.id,
      title: item.title,
      timestamp: formatMeetingTimestamp(item.createdAt),
      meetingUrl: item.meetingUrl,
    })),
  }
}

export async function listMeetings(input: {
  workspaceId: string
  cursor?: string
  limit: number
  isStarred?: boolean
}): Promise<{ meetings: MeetingDTO[]; nextCursor: string | null }> {
  let decoded: { createdAt: Date; id: string } | undefined
  if (input.cursor) {
    try {
      decoded = decodeMeetingListCursor(input.cursor)
    } catch {
      throw new Error("INVALID_CURSOR")
    }
  }

  const pageSize = clampPageSize(input.limit)
  const rows = await meetingsRepo.listByWorkspace({
    workspaceId: input.workspaceId,
    take: pageSize + 1,
    cursor: decoded,
    isStarred: input.isStarred,
  })

  const hasMore = rows.length > pageSize
  const page = hasMore ? rows.slice(0, pageSize) : rows
  const last = page[page.length - 1]

  const nextCursor =
    hasMore && last
      ? encodeMeetingListCursor({
          c: last.createdAt.toISOString(),
          i: last.id,
        })
      : null

  return {
    meetings: page.map((row) => toMeetingDTO(row)),
    nextCursor,
  }
}

export async function getMeetingById(input: {
  meetingId: string
  workspaceId: string
}): Promise<MeetingDTO | null> {
  const row = await meetingsRepo.findByIdForWorkspace(
    input.meetingId,
    input.workspaceId
  )
  return row ? toMeetingDTO(row, "detail") : null
}

export async function patchMeeting(input: {
  meetingId: string
  workspaceId: string
  title?: string
  isShared?: boolean
  isStarred?: boolean
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const data: Prisma.MeetingUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.isShared !== undefined) data.isShared = input.isShared
  if (input.isStarred !== undefined) data.isStarred = input.isStarred

  if (Object.keys(data).length === 0) {
    const exists = await meetingsRepo.findByIdForWorkspace(
      input.meetingId,
      input.workspaceId
    )
    return exists ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
  }

  const { updated } = await meetingsRepo.updateByWorkspace({
    meetingId: input.meetingId,
    workspaceId: input.workspaceId,
    data,
  })

  return updated > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function deleteMeeting(input: {
  meetingId: string
  workspaceId: string
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const n = await meetingsRepo.softDelete(input.meetingId, input.workspaceId)
  return n > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function getConversation(input: {
  meetingId: string
  workspaceId: string
}): Promise<Conversation | null> {
  const meeting = await meetingsRepo.findMeetingIdInWorkspace(
    input.meetingId,
    input.workspaceId
  )

  if (!meeting) return null

  const segments = await meetingsRepo.listTranscriptSegments(meeting.id)
  return toConversationResponse(meeting.id, segments)
}

export async function canUserAccessMeeting(input: {
  meetingId: string
  userId: string
  workspaceId?: string
}): Promise<boolean> {
  const row = await meetingsRepo.findMeetingForUser(input)
  return Boolean(row)
}
