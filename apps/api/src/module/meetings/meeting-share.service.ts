import type {
  MeetingGeneralAccess as ApiGeneralAccess,
  MeetingShareCollaborator,
  MeetingShareRole as ApiShareRole,
  MeetingShareState,
  InviteMeetingShareResponse,
} from "@workspace/types"
import type {
  MeetingGeneralAccess,
  MeetingShareRole,
} from "@workspace/database"
import { deliverUserNotification } from "@workspace/database"
import { resolveUserImageUrl } from "../../lib/user-avatar"
import { initialsFromName } from "./meetings.presenter"
import { meetingShareRepo } from "./meeting-share.repo"
import {
  buildMeetingShareUrl,
  sendMeetingShareInviteEmail,
} from "./meeting-share.email"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toApiRole(role: MeetingShareRole): ApiShareRole {
  return role === "EDITOR" ? "edit" : "view"
}

function toDbRole(role: ApiShareRole): MeetingShareRole {
  return role === "edit" ? "EDITOR" : "VIEWER"
}

function toApiGeneralAccess(value: MeetingGeneralAccess): ApiGeneralAccess {
  switch (value) {
    case "WORKSPACE":
      return "workspace"
    case "LINK":
      return "link"
    default:
      return "restricted"
  }
}

function toDbGeneralAccess(value: ApiGeneralAccess): MeetingGeneralAccess {
  switch (value) {
    case "workspace":
      return "WORKSPACE"
    case "link":
      return "LINK"
    default:
      return "RESTRICTED"
  }
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

function canManageShares(input: {
  ownerId: string
  userId: string
  userShareRole: MeetingShareRole | null
}): boolean {
  if (input.ownerId === input.userId) return true
  return input.userShareRole === "EDITOR"
}

export async function userCanAccessMeeting(input: {
  meetingId: string
  userId: string
  userEmail: string
}): Promise<boolean> {
  const meeting = await meetingShareRepo.findMeetingById(input.meetingId)
  if (!meeting) return false

  if (meeting.userId === input.userId) return true

  const normalizedEmail = normalizeEmail(input.userEmail)

  if (meeting.generalAccess === "LINK" && meeting.isShared) {
    return true
  }

  if (meeting.generalAccess === "WORKSPACE") {
    return meetingShareRepo.isWorkspaceMember(meeting.workspaceId, input.userId)
  }

  return meeting.meetingShares.some(
    (share) => share.userId === input.userId || share.email === normalizedEmail
  )
}

export async function getMeetingShareState(input: {
  meetingId: string
  workspaceId: string
  userId: string
  userEmail: string
}): Promise<MeetingShareState | null> {
  const allowed = await userCanAccessMeeting({
    meetingId: input.meetingId,
    userId: input.userId,
    userEmail: input.userEmail,
  })
  if (!allowed) return null

  const meeting = await meetingShareRepo.findMeetingById(input.meetingId)
  if (!meeting) return null

  const normalizedEmail = normalizeEmail(input.userEmail)
  const userShare = meeting.meetingShares.find(
    (s) => s.userId === input.userId || s.email === normalizedEmail
  )

  const canManage = canManageShares({
    ownerId: meeting.userId,
    userId: input.userId,
    userShareRole: userShare?.role ?? null,
  })

  const collaborators: MeetingShareCollaborator[] = [
    {
      id: meeting.user.id,
      email: meeting.user.email,
      name: meeting.user.name,
      avatarUrl: resolveUserImageUrl(meeting.user.id, meeting.user.image),
      avatarInitials: getAvatarInitials(meeting.user.name),
      role: "edit",
      isOwner: true,
      isCurrentUser: meeting.user.id === input.userId,
    },
    ...meeting.meetingShares.map((share) => {
      const label = share.user?.name ?? share.email
      return {
        id: share.id,
        email: share.email,
        name: share.user?.name ?? null,
        avatarUrl: share.user
          ? resolveUserImageUrl(share.user.id, share.user.image)
          : null,
        avatarInitials: initialsFromName(label),
        role: toApiRole(share.role),
        isOwner: false,
        isCurrentUser:
          share.userId === input.userId || share.email === normalizedEmail,
      }
    }),
  ]

  return {
    meetingId: meeting.id,
    generalAccess: toApiGeneralAccess(meeting.generalAccess),
    linkEnabled: meeting.isShared,
    shareUrl: buildMeetingShareUrl(meeting.id),
    collaborators,
    canManage,
  }
}

export async function inviteToMeeting(input: {
  meetingId: string
  workspaceId: string
  inviterUserId: string
  inviterName: string
  inviterEmail: string
  emails: string[]
  role: ApiShareRole
}): Promise<
  | { ok: true; result: InviteMeetingShareResponse }
  | { ok: false; error: "NOT_FOUND" | "FORBIDDEN" }
> {
  const meeting = await meetingShareRepo.findMeetingContext(
    input.meetingId,
    input.workspaceId
  )
  if (!meeting) return { ok: false, error: "NOT_FOUND" }

  const inviterShare = meeting.meetingShares.find(
    (s) =>
      s.userId === input.inviterUserId ||
      s.email === normalizeEmail(input.inviterEmail)
  )

  if (
    !canManageShares({
      ownerId: meeting.userId,
      userId: input.inviterUserId,
      userShareRole: inviterShare?.role ?? null,
    })
  ) {
    return { ok: false, error: "FORBIDDEN" }
  }

  const ownerEmail = normalizeEmail(meeting.user.email)
  const invited: InviteMeetingShareResponse["invited"] = []
  const skipped: InviteMeetingShareResponse["skipped"] = []
  const dbRole = toDbRole(input.role)
  const meetingUrl = buildMeetingShareUrl(meeting.id)

  for (const raw of input.emails) {
    const email = normalizeEmail(raw)
    if (!email.includes("@")) {
      skipped.push({ email: raw, reason: "INVALID" })
      continue
    }
    if (email === ownerEmail) {
      skipped.push({ email, reason: "OWNER" })
      continue
    }

    const existing = meeting.meetingShares.find((s) => s.email === email)
    if (existing && existing.role === dbRole) {
      skipped.push({ email, reason: "ALREADY_SHARED" })
      continue
    }

    const matchedUser = await meetingShareRepo.findUserByEmail(email)
    const share = await meetingShareRepo.upsertShare({
      meetingId: meeting.id,
      email,
      userId: matchedUser?.id ?? null,
      role: dbRole,
      invitedByUserId: input.inviterUserId,
    })

    invited.push({ email, shareId: share.id })

    if (
      matchedUser?.id &&
      matchedUser.id !== input.inviterUserId &&
      email !== normalizeEmail(input.inviterEmail)
    ) {
      await deliverUserNotification({
        userId: matchedUser.id,
        type: "COLLABORATION",
        title: "Meeting shared with you",
        body: `${input.inviterName} invited you to "${meeting.title}".`,
        href: `/meeting/${meeting.id}`,
      }).catch(() => {
        /* notification is best-effort */
      })
    }

    if (email !== normalizeEmail(input.inviterEmail)) {
      await sendMeetingShareInviteEmail({
        to: email,
        inviterName: input.inviterName,
        meetingTitle: meeting.title,
        meetingUrl,
        role: input.role,
      }).catch(() => {
        /* email is best-effort when Resend is configured */
      })
    }
  }

  return { ok: true, result: { invited, skipped } }
}

export async function updateMeetingShareRole(input: {
  meetingId: string
  workspaceId: string
  shareId: string
  userId: string
  userEmail: string
  role: ApiShareRole
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" | "FORBIDDEN" }> {
  const meeting = await meetingShareRepo.findMeetingContext(
    input.meetingId,
    input.workspaceId
  )
  if (!meeting) return { ok: false, error: "NOT_FOUND" }

  const userShare = meeting.meetingShares.find(
    (s) =>
      s.userId === input.userId || s.email === normalizeEmail(input.userEmail)
  )

  if (
    !canManageShares({
      ownerId: meeting.userId,
      userId: input.userId,
      userShareRole: userShare?.role ?? null,
    })
  ) {
    return { ok: false, error: "FORBIDDEN" }
  }

  const { count } = await meetingShareRepo.updateShareRole({
    shareId: input.shareId,
    meetingId: input.meetingId,
    role: toDbRole(input.role),
  })

  return count > 0 ? { ok: true } : { ok: false, error: "NOT_FOUND" }
}

export async function revokeMeetingShare(input: {
  meetingId: string
  workspaceId: string
  shareId: string
  userId: string
  userEmail: string
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" | "FORBIDDEN" }> {
  const meeting = await meetingShareRepo.findMeetingContext(
    input.meetingId,
    input.workspaceId
  )
  if (!meeting) return { ok: false, error: "NOT_FOUND" }

  const userShare = meeting.meetingShares.find(
    (s) =>
      s.userId === input.userId || s.email === normalizeEmail(input.userEmail)
  )

  if (
    !canManageShares({
      ownerId: meeting.userId,
      userId: input.userId,
      userShareRole: userShare?.role ?? null,
    })
  ) {
    return { ok: false, error: "FORBIDDEN" }
  }

  const { count } = await meetingShareRepo.deleteShare(
    input.shareId,
    input.meetingId
  )
  return count > 0 ? { ok: true } : { ok: false, error: "NOT_FOUND" }
}

export async function updateMeetingGeneralAccess(input: {
  meetingId: string
  workspaceId: string
  userId: string
  userEmail: string
  generalAccess: ApiGeneralAccess
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" | "FORBIDDEN" }> {
  const meeting = await meetingShareRepo.findMeetingContext(
    input.meetingId,
    input.workspaceId
  )
  if (!meeting) return { ok: false, error: "NOT_FOUND" }

  if (meeting.userId !== input.userId) {
    return { ok: false, error: "FORBIDDEN" }
  }

  const dbAccess = toDbGeneralAccess(input.generalAccess)
  const isShared = dbAccess === "LINK"

  const { count } = await meetingShareRepo.updateGeneralAccess({
    meetingId: input.meetingId,
    workspaceId: input.workspaceId,
    generalAccess: dbAccess,
    isShared,
  })

  return count > 0 ? { ok: true } : { ok: false, error: "NOT_FOUND" }
}
