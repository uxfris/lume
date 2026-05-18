import type { ApiWorkspaceRole } from "@workspace/types"

export function canManageMembers(role: ApiWorkspaceRole | undefined): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function canManageBilling(role: ApiWorkspaceRole | undefined): boolean {
  return role === "OWNER" || role === "ADMIN"
}

export function isWorkspaceOwner(role: ApiWorkspaceRole | undefined): boolean {
  return role === "OWNER"
}
