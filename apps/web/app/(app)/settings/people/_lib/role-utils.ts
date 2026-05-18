import type { ApiInviteRole } from "@workspace/types"

export const ASSIGNABLE_UI_ROLES = ["admin", "member", "guest"] as const

export function uiRoleToApiRole(role: string): ApiInviteRole {
  return role.toUpperCase() as ApiInviteRole
}
