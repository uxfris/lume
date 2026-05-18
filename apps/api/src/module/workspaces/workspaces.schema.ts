import { z } from "zod"
import {
  AcceptInvitationResponseSchema,
  ApiInviteRoleSchema,
  ApiWorkspaceRoleSchema,
  CreateInvitationResponseSchema,
  ListWorkspacesResponseSchema,
  WorkspacePeopleInvitationTableResponseSchema,
  WorkspacePeopleTableResponseSchema,
  WorkspaceSummarySchema,
} from "@workspace/types"

export const listWorkspacesResponseSchema = ListWorkspacesResponseSchema

export const createWorkspaceBodySchema = z.object({
  name: z.string().min(1).max(120),
})

export const workspaceParamsSchema = z.object({
  id: z.string().min(1),
})

export const updateWorkspaceBodySchema = z.object({
  name: z.string().min(1).max(120),
})

export const workspaceSummarySchema = WorkspaceSummarySchema

export const createInvitationBodySchema = z.object({
  email: z.email(),
  role: ApiInviteRoleSchema.default("MEMBER"),
})

export const createInvitationResponseSchema = CreateInvitationResponseSchema

export const errorResponseSchema = z.object({
  error: z.string(),
})

export const noContentResponseSchema = z.null()

export const invitationTokenParamsSchema = z.object({
  token: z.string().min(1),
})

export const acceptInvitationResponseSchema = AcceptInvitationResponseSchema

export const revokeInvitationParamsSchema = z.object({
  id: z.string().min(1),
  invitationId: z.string().min(1),
})

export const memberParamsSchema = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
})

export const updateMemberRoleBodySchema = z.object({
  role: ApiWorkspaceRoleSchema,
})

export const createInviteLinkBodySchema = z.object({
  role: ApiInviteRoleSchema.default("MEMBER"),
})

export const inviteLinkResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string(),
  role: ApiInviteRoleSchema,
})

export const inviteLinkMetadataSchema = z.object({
  role: ApiInviteRoleSchema,
  expiresAt: z.string(),
  createdAt: z.string(),
})

export const inviteLinkGetResponseSchema = z.object({
  link: inviteLinkMetadataSchema.nullable(),
})

export const listWorkspacePeopleResponseSchema =
  WorkspacePeopleTableResponseSchema

export const listWorkspaceInvitationsResponseSchema =
  WorkspacePeopleInvitationTableResponseSchema
