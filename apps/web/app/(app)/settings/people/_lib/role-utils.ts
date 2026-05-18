import type { ApiInviteRole, ApiWorkspaceRole } from "@workspace/types"

export const ASSIGNABLE_UI_ROLES = ["admin", "member", "guest"] as const
export const OWNER_UI_ROLE = "owner" as const

export function uiRoleToApiRole(role: string): ApiInviteRole | ApiWorkspaceRole {
  return role.toUpperCase() as ApiInviteRole | ApiWorkspaceRole
}

export function isProUiRole(roleId: string): boolean {
  return roleId === "admin" || roleId === "guest"
}

export function getAssignableUiRoles(
  actorRole: ApiWorkspaceRole | undefined
): string[] {
  const roles: string[] = [...ASSIGNABLE_UI_ROLES]
  if (actorRole === "OWNER") {
    roles.push(OWNER_UI_ROLE)
  }
  return roles
}
