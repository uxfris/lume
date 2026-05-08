import { z } from "zod"

/** Workspace roles used by backend/domain records (uppercase Prisma enum values). */
export const ApiWorkspaceRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "GUEST"])
export type ApiWorkspaceRole = z.infer<typeof ApiWorkspaceRoleSchema>

export const ApiInviteRoleSchema = z.enum(["ADMIN", "MEMBER", "GUEST"])
export type ApiInviteRole = z.infer<typeof ApiInviteRoleSchema>

export const WorkspaceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>

export const WorkspaceMembershipSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  role: ApiWorkspaceRoleSchema,
  joinedAt: z.string(),
})
export type WorkspaceMembership = z.infer<typeof WorkspaceMembershipSchema>

export const ListWorkspacesResponseSchema = z.object({
  workspaces: z.array(WorkspaceMembershipSchema),
})
export type ListWorkspacesResponse = z.infer<typeof ListWorkspacesResponseSchema>

export const CurrentUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
})
export type CurrentUser = z.infer<typeof CurrentUserSchema>

export const GetMeResponseSchema = z.object({
  user: CurrentUserSchema,
  workspaces: z.array(WorkspaceMembershipSchema),
  activeWorkspaceId: z.string().nullable(),
  /** Social accounts that can be used for Recall Calendar V2 (`google` / `microsoft`). */
  oauthCalendarProviders: z.array(z.enum(["google", "microsoft"])),
})
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>

export const CreateInvitationResponseSchema = z.object({
  invitationId: z.string(),
  token: z.string(),
  expiresAt: z.string(),
})
export type CreateInvitationResponse = z.infer<typeof CreateInvitationResponseSchema>

export const AcceptInvitationResponseSchema = z.object({
  workspaceId: z.string(),
  role: ApiWorkspaceRoleSchema,
})
export type AcceptInvitationResponse = z.infer<typeof AcceptInvitationResponseSchema>
