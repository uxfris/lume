import { z } from "zod"

/** Workspace roles used by backend/domain records (uppercase Prisma enum values). */
export const ApiWorkspaceRoleSchema = z.enum([
  "OWNER",
  "ADMIN",
  "MEMBER",
  "GUEST",
])
export type ApiWorkspaceRole = z.infer<typeof ApiWorkspaceRoleSchema>

export const ApiInviteRoleSchema = z.enum(["ADMIN", "MEMBER", "GUEST"])
export type ApiInviteRole = z.infer<typeof ApiInviteRoleSchema>

export const WorkspaceHandleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(20, "Handle must be at most 20 characters")
  .regex(
    /^[a-z0-9_-]+$/,
    "Handle can only contain lowercase letters, numbers, underscores, and hyphens"
  )

export type WorkspaceHandle = z.infer<typeof WorkspaceHandleSchema>

export const UpdateWorkspaceBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    slug: WorkspaceHandleSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.slug !== undefined, {
    message: "Provide a name or slug to update",
  })

export type UpdateWorkspaceBody = z.infer<typeof UpdateWorkspaceBodySchema>

export const WorkspaceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
})
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>

export const WorkspaceMembershipSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  role: ApiWorkspaceRoleSchema,
  joinedAt: z.string(),
})
export type WorkspaceMembership = z.infer<typeof WorkspaceMembershipSchema>

export const ListWorkspacesResponseSchema = z.object({
  workspaces: z.array(WorkspaceMembershipSchema),
})
export type ListWorkspacesResponse = z.infer<
  typeof ListWorkspacesResponseSchema
>

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
  emailSent: z.boolean(),
})
export type CreateInvitationResponse = z.infer<
  typeof CreateInvitationResponseSchema
>

export const AcceptInvitationResponseSchema = z.object({
  workspaceId: z.string(),
  role: ApiWorkspaceRoleSchema,
})
export type AcceptInvitationResponse = z.infer<
  typeof AcceptInvitationResponseSchema
>

export const WorkspaceInviteLinkResponseSchema = z.object({
  url: z.url(),
  expiresAt: z.string(),
  role: ApiInviteRoleSchema,
})
export type WorkspaceInviteLinkResponse = z.infer<
  typeof WorkspaceInviteLinkResponseSchema
>

export const WorkspaceInviteLinkMetadataSchema = z.object({
  role: ApiInviteRoleSchema,
  expiresAt: z.string(),
  createdAt: z.string(),
})
export type WorkspaceInviteLinkMetadata = z.infer<
  typeof WorkspaceInviteLinkMetadataSchema
>

export const WorkspaceInviteLinkGetResponseSchema = z.object({
  link: WorkspaceInviteLinkMetadataSchema.nullable(),
})
export type WorkspaceInviteLinkGetResponse = z.infer<
  typeof WorkspaceInviteLinkGetResponseSchema
>
