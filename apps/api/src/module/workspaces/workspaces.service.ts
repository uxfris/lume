import { createHash, randomBytes } from "node:crypto"
import type { Workspace, WorkspaceRole } from "@workspace/database"
import { ensurePersonalWorkspace } from "@workspace/auth"
import { resolveUserImageUrl } from "../../lib/user-avatar"
import { workspacesRepo } from "./workspaces.repo"
import {
  buildWorkspaceInviteUrl,
  sendWorkspaceInviteEmail,
} from "./workspace.email"

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000
const MAX_SLUG_ATTEMPTS = 5
const PRISMA_UNIQUE = "P2002"

export type InviteRole = Exclude<WorkspaceRole, "OWNER">
export type AssignableMemberRole = InviteRole

type MemberManagementError =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "TARGET_NOT_FOUND"
  | "CANNOT_CHANGE_OWN_ROLE"
  | "CANNOT_MODIFY_OWNER"
  | "LAST_OWNER"
  | "INVALID_ROLE"

type LeaveWorkspaceError =
  | "NOT_FOUND"
  | "LAST_WORKSPACE"
  | "SOLE_OWNER"
export type WorkspaceMembershipWithWorkspace = Awaited<
  ReturnType<typeof workspacesRepo.listMembershipsForUser>
>[number]

function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)

  return cleaned || "workspace"
}

function randomSuffix(length = 6): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
}

function hashInviteToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex")
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function roleToPeopleRole(
  role: WorkspaceRole
): "owner" | "admin" | "member" | "guest" {
  return role.toLocaleLowerCase() as "owner" | "admin" | "member" | "guest"
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

function invitationNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? email
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ")
}

export async function listWorkspacesForUser(user: {
  id: string
  name?: string | null
  email: string
}) {
  await ensurePersonalWorkspace({
    id: user.id,
    name: user.name,
    email: user.email,
  })

  return workspacesRepo.listMembershipsForUser(user.id)
}

export async function listWorkspacePeople(
  workspaceId: string,
  currentUserId: string
) {
  const members = await workspacesRepo.listWorkspaceMembers(workspaceId)
  return members.map((row) => ({
    id: row.id,
    name: row.user.name,
    email: row.user.email,
    avatarUrl: resolveUserImageUrl(row.user.id, row.user.image),
    avatarInitials: getAvatarInitials(row.user.name),
    role: roleToPeopleRole(row.role),
    joinedAt: row.joinedAt.toISOString(),
    isCurrentUser: row.user.id === currentUserId,
  }))
}

export async function listWorkspaceInvitations(invitationId: string) {
  const invitations = await workspacesRepo.listPendingInvitations(
    invitationId,
    new Date()
  )
  const usersByEmail = new Map(
    (
      await workspacesRepo.findUsersByEmails(
        invitations.map((invitation) => invitation.email)
      )
    ).map((user) => [normalizeEmail(user.email), user] as const)
  )
  return invitations.map((invitation) => {
    const matchedUser = usersByEmail.get(invitation.email)
    const name = matchedUser?.name ?? null
    const avatarUrl = matchedUser
      ? resolveUserImageUrl(matchedUser.id, matchedUser.image)
      : null
    const initialSource = name ?? invitationNameFromEmail(invitation.email)
    return {
      id: invitation.id,
      name,
      email: invitation.email,
      avatarUrl,
      avatarInitials: getAvatarInitials(initialSource),
      role: roleToPeopleRole(invitation.role),
      invitedAt: invitation.createdAt.toISOString(),
    }
  })
}

export async function createWorkspace(
  userId: string,
  name: string
): Promise<Workspace> {
  const trimmed = name.trim()
  const baseSlug = slugify(trimmed)

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = `${baseSlug}-${randomSuffix(6)}`
    try {
      return await workspacesRepo.createWorkspaceWithOwner(
        userId,
        trimmed,
        slug
      )
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === PRISMA_UNIQUE && attempt < MAX_SLUG_ATTEMPTS - 1) continue
      throw err
    }
  }

  throw new Error("Could not allocate a unique workspace slug")
}

export async function updateWorkspaceName(
  workspaceId: string,
  userId: string,
  name: string
): Promise<
  | { ok: true; workspace: Workspace }
  | { ok: false; error: "NOT_FOUND" | "FORBIDDEN" }
> {
  const membership = await workspacesRepo.findMembershipWithWorkspace(
    workspaceId,
    userId
  )

  if (!membership) return { ok: false, error: "NOT_FOUND" }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return { ok: false, error: "FORBIDDEN" }
  }

  const workspace = await workspacesRepo.updateWorkspaceName(
    workspaceId,
    name.trim()
  )

  return { ok: true, workspace }
}

export async function createOrRefreshInvitation(
  workspaceId: string,
  inviterUserId: string,
  inviterEmail: string,
  inviterName: string | null | undefined,
  emailRaw: string,
  role: InviteRole
): Promise<
  | { ok: true; token: string; invitationId: string; expiresAt: Date }
  | {
      ok: false
      error:
        | "NOT_FOUND"
        | "FORBIDDEN"
        | "ALREADY_MEMBER"
        | "SELF_INVITE"
        | "INVITE_ALREADY_ACCEPTED"
    }
> {
  const membership = await workspacesRepo.findMembershipWithWorkspace(
    workspaceId,
    inviterUserId
  )

  if (!membership) return { ok: false, error: "NOT_FOUND" }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return { ok: false, error: "FORBIDDEN" }
  }

  const email = normalizeEmail(emailRaw)

  if (normalizeEmail(inviterEmail) === email) {
    return { ok: false, error: "SELF_INVITE" }
  }

  const existingUser = await workspacesRepo.findUserByEmail(email)

  if (existingUser) {
    const alreadyMember = await workspacesRepo.findMemberByWorkspaceAndUser(
      workspaceId,
      existingUser.id
    )
    if (alreadyMember) return { ok: false, error: "ALREADY_MEMBER" }
  }

  const prior = await workspacesRepo.findInvitationByWorkspaceAndEmail(
    workspaceId,
    email
  )

  if (prior?.acceptedAt) {
    return { ok: false, error: "INVITE_ALREADY_ACCEPTED" }
  }

  const rawToken = randomBytes(32).toString("hex")
  const tokenHash = hashInviteToken(rawToken)
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS)

  const invitation = await workspacesRepo.upsertInvitation({
    workspaceId,
    email,
    role,
    tokenHash,
    invitedByUserId: inviterUserId,
    expiresAt,
  })

  const inviteUrl = buildWorkspaceInviteUrl(rawToken)
  const displayInviterName =
    inviterName?.trim() || invitationNameFromEmail(inviterEmail)

  await sendWorkspaceInviteEmail({
    to: email,
    inviterName: displayInviterName,
    workspaceName: membership.workspace.name,
    inviteUrl,
  }).catch(() => {
    /* email is best-effort when Resend is configured */
  })

  return {
    ok: true,
    token: rawToken,
    invitationId: invitation.id,
    expiresAt,
  }
}

export async function revokeInvitation(
  workspaceId: string,
  inviterUserId: string,
  invitationId: string
): Promise<
  | { ok: true }
  | {
      ok: false
      error:
        | "NOT_FOUND"
        | "FORBIDDEN"
        | "INVITE_NOT_FOUND"
        | "INVITE_ALREADY_ACCEPTED"
        | "INVITE_ALREADY_REVOKED"
    }
> {
  const membership = await workspacesRepo.findMembershipWithWorkspace(
    workspaceId,
    inviterUserId
  )

  if (!membership) return { ok: false, error: "NOT_FOUND" }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return { ok: false, error: "FORBIDDEN" }
  }

  const invitation = await workspacesRepo.findInvitationById(invitationId)
  if (!invitation || invitation.workspaceId !== workspaceId) {
    return { ok: false, error: "INVITE_NOT_FOUND" }
  }

  if (invitation.acceptedAt) {
    return { ok: false, error: "INVITE_ALREADY_ACCEPTED" }
  }

  if (invitation.revokedAt) {
    return { ok: false, error: "INVITE_ALREADY_REVOKED" }
  }

  await workspacesRepo.markInvitationRevoked(invitationId, new Date())
  return { ok: true }
}

function canManageMembers(role: WorkspaceRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

function assertAssignableRole(role: WorkspaceRole): role is AssignableMemberRole {
  return role === "ADMIN" || role === "MEMBER" || role === "GUEST"
}

async function getActorMembership(workspaceId: string, actorUserId: string) {
  return workspacesRepo.findMembershipWithWorkspace(workspaceId, actorUserId)
}

export async function updateMemberRole(
  workspaceId: string,
  actorUserId: string,
  memberId: string,
  role: AssignableMemberRole
): Promise<{ ok: true } | { ok: false; error: MemberManagementError }> {
  const actor = await getActorMembership(workspaceId, actorUserId)
  if (!actor) return { ok: false, error: "NOT_FOUND" }
  if (!canManageMembers(actor.role)) return { ok: false, error: "FORBIDDEN" }

  const target = await workspacesRepo.findMemberById(memberId)
  if (!target || target.workspaceId !== workspaceId) {
    return { ok: false, error: "TARGET_NOT_FOUND" }
  }

  if (target.userId === actorUserId) {
    return { ok: false, error: "CANNOT_CHANGE_OWN_ROLE" }
  }

  if (target.role === "OWNER") {
    return { ok: false, error: "CANNOT_MODIFY_OWNER" }
  }

  if (!assertAssignableRole(role)) {
    return { ok: false, error: "INVALID_ROLE" }
  }

  await workspacesRepo.updateMemberRole(memberId, role)
  return { ok: true }
}

export async function removeMember(
  workspaceId: string,
  actorUserId: string,
  memberId: string
): Promise<{ ok: true } | { ok: false; error: MemberManagementError }> {
  const actor = await getActorMembership(workspaceId, actorUserId)
  if (!actor) return { ok: false, error: "NOT_FOUND" }
  if (!canManageMembers(actor.role)) return { ok: false, error: "FORBIDDEN" }

  const target = await workspacesRepo.findMemberById(memberId)
  if (!target || target.workspaceId !== workspaceId) {
    return { ok: false, error: "TARGET_NOT_FOUND" }
  }

  if (target.userId === actorUserId) {
    return { ok: false, error: "CANNOT_CHANGE_OWN_ROLE" }
  }

  if (target.role === "OWNER") {
    const ownerCount = await workspacesRepo.countOwners(workspaceId)
    if (ownerCount <= 1) {
      return { ok: false, error: "LAST_OWNER" }
    }
    if (actor.role !== "OWNER") {
      return { ok: false, error: "CANNOT_MODIFY_OWNER" }
    }
  }

  await workspacesRepo.deleteMember(memberId)
  return { ok: true }
}

export async function leaveWorkspace(
  workspaceId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: LeaveWorkspaceError }> {
  const membership = await workspacesRepo.findMembershipWithWorkspace(
    workspaceId,
    userId
  )
  if (!membership) return { ok: false, error: "NOT_FOUND" }

  const workspaceCount = await workspacesRepo.countMembershipsForUser(userId)
  if (workspaceCount <= 1) {
    return { ok: false, error: "LAST_WORKSPACE" }
  }

  if (membership.role === "OWNER") {
    const ownerCount = await workspacesRepo.countOwners(workspaceId)
    if (ownerCount <= 1) {
      return { ok: false, error: "SOLE_OWNER" }
    }
  }

  await workspacesRepo.deleteMember(membership.id)
  return { ok: true }
}

export async function acceptInvitation(
  userId: string,
  userEmail: string,
  rawToken: string
): Promise<
  | { ok: true; workspaceId: string; role: WorkspaceRole }
  | {
      ok: false
      error:
        | "INVITE_NOT_FOUND"
        | "INVITE_REVOKED"
        | "INVITE_EXPIRED"
        | "EMAIL_MISMATCH"
        | "INVITE_ALREADY_USED"
    }
> {
  const tokenHash = hashInviteToken(rawToken)
  const invitation = await workspacesRepo.findInvitationByTokenHash(tokenHash)

  if (!invitation) return { ok: false, error: "INVITE_NOT_FOUND" }
  if (invitation.revokedAt) return { ok: false, error: "INVITE_REVOKED" }
  if (invitation.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "INVITE_EXPIRED" }
  }

  if (normalizeEmail(userEmail) !== invitation.email) {
    return { ok: false, error: "EMAIL_MISMATCH" }
  }

  const existingMember = await workspacesRepo.findMemberByWorkspaceAndUser(
    invitation.workspaceId,
    userId
  )

  if (existingMember) {
    if (!invitation.acceptedAt) {
      await workspacesRepo.markInvitationAccepted(invitation.id, new Date())
    }
    return {
      ok: true,
      workspaceId: invitation.workspaceId,
      role: existingMember.role,
    }
  }

  if (invitation.acceptedAt) {
    return { ok: false, error: "INVITE_ALREADY_USED" }
  }

  await workspacesRepo.acceptInvitationAndCreateMembership({
    invitationId: invitation.id,
    workspaceId: invitation.workspaceId,
    userId,
    role: invitation.role,
    acceptedAt: new Date(),
  })

  return {
    ok: true,
    workspaceId: invitation.workspaceId,
    role: invitation.role,
  }
}
