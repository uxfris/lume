import { ensurePersonalWorkspace } from "@workspace/auth"
import { usersRepo } from "./users.repo"

type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

function resolveWorkspaceIdHeader(
  value: string | string[] | undefined
): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  return value[0] ?? null
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
