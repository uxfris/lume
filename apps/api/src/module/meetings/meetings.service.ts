import { type Prisma } from "@workspace/database"
import {
  buildSummaryV2FromStoredAndDocument,
  type Conversation,
  type Meeting as MeetingDTO,
  type MeetingAudioResponse,
  type TiptapJSONContent,
} from "@workspace/types"
import { createPresignedAudioDownload } from "../../lib/s3-predesign"
import {
  decodeMeetingListCursor,
  encodeMeetingListCursor,
} from "./meetings.cursor"
import { meetingsRepo } from "./meetings.repo"
import {
  userCanAccessMeeting as checkMeetingShareAccess,
  userCanEditMeeting,
} from "./meeting-share.service"
import { meetingShareRepo } from "./meeting-share.repo"
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
  userId: string
  userEmail: string
  cursor?: string
  limit: number
  isStarred?: boolean
  isCreatedByMe?: boolean
  isSharedWithMe?: boolean
}): Promise<{ meetings: MeetingDTO[]; nextCursor: string | null }> {
  let decoded: { createdAt: Date; id: string } | undefined
  if (input.cursor) {
    try {
      decoded = decodeMeetingListCursor(input.cursor)
    } catch {
      throw new Error("INVALID_CURSOR")
    }
  }

  await meetingShareRepo.linkSharesToUser(input.userId, input.userEmail)

  const pageSize = clampPageSize(input.limit)
  const rows = input.isSharedWithMe
    ? await meetingsRepo.listSharedWithUser({
        userId: input.userId,
        userEmail: input.userEmail,
        take: pageSize + 1,
        cursor: decoded,
        isStarred: input.isStarred,
      })
    : await meetingsRepo.listByWorkspace({
        workspaceId: input.workspaceId,
        userId: input.userId,
        userEmail: input.userEmail,
        take: pageSize + 1,
        cursor: decoded,
        isStarred: input.isStarred,
        isCreatedByMe: input.isCreatedByMe,
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
  userId: string
  userEmail: string
}): Promise<MeetingDTO | null> {
  const allowed = await checkMeetingShareAccess({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!allowed) return null

  const row = await meetingsRepo.findById(input.meetingId)
  return row ? toMeetingDTO(row, "detail") : null
}

export async function updateMeetingSummary(input: {
  meetingId: string
  userId: string
  userEmail: string
  document: TiptapJSONContent
}): Promise<
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "FORBIDDEN" }
> {
  const allowed = await checkMeetingShareAccess({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!allowed) {
    return { ok: false, reason: "NOT_FOUND" }
  }

  const canEdit = await userCanEditMeeting({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!canEdit) {
    return { ok: false, reason: "FORBIDDEN" }
  }

  const meeting = await meetingsRepo.findById(input.meetingId)
  if (!meeting) {
    return { ok: false, reason: "NOT_FOUND" }
  }

  const summary = buildSummaryV2FromStoredAndDocument(
    meeting.summary,
    input.document
  )

  const { updated } = await meetingsRepo.updateById({
    meetingId: input.meetingId,
    data: {
      summary: summary as unknown as Prisma.InputJsonValue,
    },
  })

  return updated > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
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
  if (input.isShared !== undefined) {
    data.isShared = input.isShared
    data.generalAccess = input.isShared ? "LINK" : "RESTRICTED"
  }
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

export async function deleteMeetings(input: {
  workspaceId: string
  meetingIds: string[]
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const uniqueIds = [...new Set(input.meetingIds)]
  const result = await meetingsRepo.softDeleteMany({
    workspaceId: input.workspaceId,
    meetingIds: uniqueIds,
  })

  return result.ok ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function unstarMeetings(input: {
  workspaceId: string
  meetingIds: string[]
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const uniqueIds = [...new Set(input.meetingIds)]
  const result = await meetingsRepo.unstarManyInWorkspace({
    workspaceId: input.workspaceId,
    meetingIds: uniqueIds,
  })

  return result.ok ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function moveMeetingsToWorkspace(input: {
  userId: string
  sourceWorkspaceId: string
  targetWorkspaceId: string
  meetingIds: string[]
}): Promise<
  | { ok: true }
  | {
      ok: false
      reason: "SAME_WORKSPACE" | "TARGET_ACCESS_DENIED" | "NOT_FOUND"
    }
> {
  if (input.targetWorkspaceId === input.sourceWorkspaceId) {
    return { ok: false, reason: "SAME_WORKSPACE" }
  }

  const targetMembership = await meetingsRepo.findTargetMembership({
    userId: input.userId,
    targetWorkspaceId: input.targetWorkspaceId,
  })

  if (!targetMembership) {
    return { ok: false, reason: "TARGET_ACCESS_DENIED" }
  }

  const uniqueIds = [...new Set(input.meetingIds)]
  const result = await meetingsRepo.moveManyToWorkspace({
    fromWorkspaceId: input.sourceWorkspaceId,
    toWorkspaceId: input.targetWorkspaceId,
    meetingIds: uniqueIds,
  })

  return result.ok ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function getMeetingAudio(input: {
  meetingId: string
  userId: string
  userEmail: string
}): Promise<MeetingAudioResponse | null> {
  const allowed = await checkMeetingShareAccess({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!allowed) return null

  const meeting = await meetingsRepo.findById(input.meetingId)
  if (!meeting?.audioKey) return null

  return createPresignedAudioDownload(meeting.audioKey)
}

export async function getConversation(input: {
  meetingId: string
  userId: string
  userEmail: string
}): Promise<Conversation | null> {
  const allowed = await checkMeetingShareAccess({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!allowed) return null

  const meeting = await meetingsRepo.findById(input.meetingId)

  if (!meeting) return null

  const segments = await meetingsRepo.listTranscriptSegments(meeting.id)
  return toConversationResponse(meeting.id, segments)
}

export async function canUserAccessMeeting(input: {
  meetingId: string
  userId: string
  userEmail: string
}): Promise<boolean> {
  return checkMeetingShareAccess({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
}
