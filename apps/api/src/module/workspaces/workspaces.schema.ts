import { z } from "zod"
import {
  AcceptInvitationResponseSchema,
  ApiInviteRoleSchema,
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
  role: ApiInviteRoleSchema,
})

export const listWorkspacePeopleResponseSchema =
  WorkspacePeopleTableResponseSchema

export const listWorkspaceInvitationsResponseSchema =
  WorkspacePeopleInvitationTableResponseSchema
