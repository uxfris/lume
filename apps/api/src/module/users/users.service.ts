import type { AccountDeletionReason } from "@workspace/types"
import { ensurePersonalWorkspace } from "@workspace/auth"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { env } from "../../config/env"
import { getStripe } from "../../lib/stripe"
import { s3 } from "../../lib/s3"
import {
  buildUserAvatarKey,
  createPresignedAvatarUpload,
  headUploadedObject,
} from "../../lib/s3-predesign"
import {
  buildUserAvatarApiPath,
  resolveUserImageUrl,
} from "../../lib/user-avatar"
import { usersRepo } from "./users.repo"

type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const ALLOWED_AVATAR_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

function resolveWorkspaceIdHeader(
  value: string | string[] | undefined
): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value[0] ?? null
}

function toCurrentUser(user: {
  id: string
  name: string
  email: string
  image: string | null
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: resolveUserImageUrl(user.id, user.image),
  }
}

export async function getMe(input: {
  user: SessionUser
  workspaceIdHeader?: string | string[]
}) {
  await ensurePersonalWorkspace({
    id: input.user.id,
    name: input.user.name,
    email: input.user.email,
  })

  const [memberships, oauthAccounts] = await Promise.all([
    usersRepo.listMembershipsForUser(input.user.id),
    usersRepo.listOAuthCalendarProviders(input.user.id),
  ])

  const oauthCalendarProviders = oauthAccounts
    .map((a) => a.providerId)
    .filter(
      (id): id is "google" | "microsoft" =>
        id === "google" || id === "microsoft"
    )
  const requestedWorkspaceId = resolveWorkspaceIdHeader(input.workspaceIdHeader)

  const activeWorkspaceId =
    memberships.find((item) => item.workspaceId === requestedWorkspaceId)
      ?.workspaceId ??
    memberships[0]?.workspaceId ??
    null

  return {
    user: {
      id: input.user.id,
      name: input.user.name,
      email: input.user.email,
      image: resolveUserImageUrl(input.user.id, input.user.image),
    },
    workspaces: memberships.map((item) => ({
      id: item.workspace.id,
      name: item.workspace.name,
      slug: item.workspace.slug,
      role: item.role,
      joinedAt: item.joinedAt.toISOString(),
    })),
    activeWorkspaceId,
    oauthCalendarProviders,
  }
}

export async function updateProfile(input: { userId: string; name: string }) {
  const user = await usersRepo.updateProfile(input.userId, {
    name: input.name.trim(),
  })
  return toCurrentUser(user)
}

export function buildAvatarImageUrl(userId: string) {
  return buildUserAvatarApiPath(userId)
}

export async function presignAvatar(input: {
  userId: string
  contentType: string
}) {
  return createPresignedAvatarUpload({
    userId: input.userId,
    contentType: input.contentType,
  })
}

export async function completeAvatar(input: { userId: string }) {
  const key = buildUserAvatarKey(input.userId)

  let head: Awaited<ReturnType<typeof headUploadedObject>>
  try {
    head = await headUploadedObject(key)
  } catch {
    return { ok: false as const, error: "OBJECT_NOT_IN_S3" as const }
  }

  if (head.contentLength == null || head.contentLength > MAX_AVATAR_BYTES) {
    return { ok: false as const, error: "FILE_TOO_LARGE" as const }
  }

  if (
    !head.contentType ||
    !ALLOWED_AVATAR_CONTENT_TYPES.has(head.contentType)
  ) {
    return { ok: false as const, error: "INVALID_CONTENT_TYPE" as const }
  }

  const user = await usersRepo.updateProfile(input.userId, {
    image: buildUserAvatarApiPath(input.userId),
  })

  return { ok: true as const, user: toCurrentUser(user) }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeWorkspaceName(name: string): string {
  return name.trim()
}

export async function getAccountDeletionContext(userId: string) {
  const [user, soleOwnerWorkspaces] = await Promise.all([
    usersRepo.findUserEmail(userId),
    usersRepo.listSoleOwnerWorkspaces(userId),
  ])

  if (!user) {
    return { ok: false as const, error: "USER_NOT_FOUND" as const }
  }

  return {
    ok: true as const,
    context: {
      email: user.email,
      soleOwnerWorkspaces,
    },
  }
}

async function cancelWorkspaceStripeSubscription(stripeSubscriptionId: string) {
  const stripe = getStripe()
  if (!stripe) return

  try {
    await stripe.subscriptions.cancel(stripeSubscriptionId)
  } catch {
    // Best-effort: workspace row is removed even if Stripe is unreachable.
  }
}

async function deleteUserAvatarFromS3(userId: string) {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: buildUserAvatarKey(userId),
      })
    )
  } catch {
    // Avatar may not exist.
  }
}

export async function deleteAccount(input: {
  userId: string
  email: string
  confirmedWorkspaceNames: string[]
  reason?: AccountDeletionReason
}) {
  const user = await usersRepo.findUserEmail(input.userId)
  if (!user) {
    return { ok: false as const, error: "USER_NOT_FOUND" as const }
  }

  if (normalizeEmail(input.email) !== normalizeEmail(user.email)) {
    return { ok: false as const, error: "EMAIL_MISMATCH" as const }
  }

  const soleOwnerWorkspaces = await usersRepo.listSoleOwnerWorkspaces(
    input.userId
  )
  const confirmedNames = new Set(
    input.confirmedWorkspaceNames.map(normalizeWorkspaceName)
  )

  for (const workspace of soleOwnerWorkspaces) {
    if (!confirmedNames.has(normalizeWorkspaceName(workspace.name))) {
      return {
        ok: false as const,
        error: "WORKSPACE_NAME_MISMATCH" as const,
        workspaceName: workspace.name,
      }
    }
  }

  const soleOwnerWorkspaceIds = new Set(
    soleOwnerWorkspaces.map((workspace) => workspace.id)
  )
  const memberships = await usersRepo.listMembershipWorkspaceIds(input.userId)
  const sharedWorkspaceIds = memberships
    .map((membership) => membership.workspaceId)
    .filter((workspaceId) => !soleOwnerWorkspaceIds.has(workspaceId))

  for (const workspace of soleOwnerWorkspaces) {
    if (workspace.stripeSubscriptionId) {
      await cancelWorkspaceStripeSubscription(workspace.stripeSubscriptionId)
    }
  }

  await usersRepo.deleteMeetingsForUserInWorkspaces(
    input.userId,
    sharedWorkspaceIds
  )
  await usersRepo.deleteChannelsCreatedByUser(input.userId)
  await usersRepo.deleteWorkspaces([...soleOwnerWorkspaceIds])
  await deleteUserAvatarFromS3(input.userId)
  await usersRepo.deleteUser(input.userId)

  return {
    ok: true as const,
    reason: input.reason ?? null,
  }
}
