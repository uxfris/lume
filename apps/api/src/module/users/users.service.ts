import { ensurePersonalWorkspace } from "@workspace/auth"
import {
  buildPublicObjectUrl,
  buildUserAvatarKey,
  createPresignedAvatarUpload,
  headUploadedObject,
} from "../../lib/s3-predesign"
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
    image: user.image,
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
    .filter((id): id is "google" | "microsoft" => id === "google" || id === "microsoft")
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
      image: input.user.image ?? null,
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
    image: buildPublicObjectUrl(key),
  })

  return { ok: true as const, user: toCurrentUser(user) }
}
