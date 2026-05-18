import {
  GetMeResponseSchema,
  ListWorkspacesResponseSchema,
  WorkspaceSummarySchema,
  type GetMeResponse,
  type WorkspaceMembership,
  type WorkspaceSummary,
  WorkspacePeopleTableResponseSchema,
  WorkspaceMember,
  CreateInvitationResponseSchema,
  CreateInvitationResponse,
  AcceptInvitationResponse,
  AcceptInvitationResponseSchema,
  WorkspaceMemberInvitation,
  WorkspacePeopleInvitationTableResponseSchema,
  WorkspaceInviteLinkGetResponseSchema,
  WorkspaceInviteLinkResponseSchema,
  PresignAvatarResponseSchema,
  type WorkspaceInviteLinkGetResponse,
  type WorkspaceInviteLinkResponse,
  type ApiInviteRole,
  type UpdateWorkspaceBody,
  type PresignAvatarBody,
  type PresignAvatarResponse,
} from "@workspace/types"
import { client } from "./client"

export const workspaceApi = {
  async getMe(): Promise<GetMeResponse> {
    const data = await client.get<unknown>("/users/me")
    return GetMeResponseSchema.parse(data)
  },

  async list(): Promise<WorkspaceMembership[]> {
    const data = await client.get<unknown>("/workspaces")
    const parsed = ListWorkspacesResponseSchema.parse(data)
    return parsed.workspaces
  },

  async listPeople(workspaceId: string): Promise<WorkspaceMember[]> {
    const data = await client.get<unknown>(`/workspaces/${workspaceId}/people`)
    const parsed = WorkspacePeopleTableResponseSchema.parse(data)
    return parsed.people
  },

  async listInvitations(
    workspaceId: string
  ): Promise<WorkspaceMemberInvitation[]> {
    const data = await client.get<unknown>(
      `/workspaces/${workspaceId}/invitations`
    )
    const parsed =
      WorkspacePeopleInvitationTableResponseSchema.parse(data).invitations

    return parsed
  },

  async create(name: string): Promise<WorkspaceSummary> {
    const data = await client.post<unknown>("/workspaces", { name })
    return WorkspaceSummarySchema.parse(data)
  },

  async update(
    workspaceId: string,
    body: UpdateWorkspaceBody
  ): Promise<WorkspaceSummary> {
    const data = await client.patch<unknown>(`/workspaces/${workspaceId}`, body)
    return WorkspaceSummarySchema.parse(data)
  },

  async presignAvatar(
    workspaceId: string,
    body: PresignAvatarBody
  ): Promise<PresignAvatarResponse> {
    const data = await client.post<unknown>(
      `/workspaces/${workspaceId}/avatar/presign`,
      body
    )
    return PresignAvatarResponseSchema.parse(data)
  },

  async completeAvatar(workspaceId: string): Promise<WorkspaceSummary> {
    const data = await client.post<unknown>(
      `/workspaces/${workspaceId}/avatar/complete`,
      {}
    )
    return WorkspaceSummarySchema.parse(data)
  },

  async invite(
    email: string,
    role: string,
    workspaceId: string
  ): Promise<CreateInvitationResponse> {
    const data = await client.post<unknown>(
      `/workspaces/${workspaceId}/invitations`,
      {
        email,
        role,
      }
    )
    return CreateInvitationResponseSchema.parse(data)
  },

  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const data = await client.post<unknown>(`/invitations/${token}/accept`)
    return AcceptInvitationResponseSchema.parse(data)
  },

  async revokeInvitation(
    workspaceId: string,
    invitationId: string
  ): Promise<void> {
    await client.delete<unknown>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`
    )
  },

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: string
  ): Promise<void> {
    await client.patch<unknown>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      { role }
    )
  },

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await client.delete<unknown>(
      `/workspaces/${workspaceId}/members/${memberId}`
    )
  },

  async leaveWorkspace(workspaceId: string): Promise<void> {
    await client.post<unknown>(`/workspaces/${workspaceId}/leave`)
  },

  async getInviteLink(
    workspaceId: string
  ): Promise<WorkspaceInviteLinkGetResponse> {
    const data = await client.get<unknown>(
      `/workspaces/${workspaceId}/invite-link`
    )
    return WorkspaceInviteLinkGetResponseSchema.parse(data)
  },

  async createInviteLink(
    workspaceId: string,
    role: ApiInviteRole
  ): Promise<WorkspaceInviteLinkResponse> {
    const data = await client.post<unknown>(
      `/workspaces/${workspaceId}/invite-link`,
      { role }
    )
    return WorkspaceInviteLinkResponseSchema.parse(data)
  },

  async regenerateInviteLink(
    workspaceId: string,
    role: ApiInviteRole
  ): Promise<WorkspaceInviteLinkResponse> {
    const data = await client.post<unknown>(
      `/workspaces/${workspaceId}/invite-link/regenerate`,
      { role }
    )
    return WorkspaceInviteLinkResponseSchema.parse(data)
  },

  async revokeInviteLink(workspaceId: string): Promise<void> {
    await client.delete<unknown>(`/workspaces/${workspaceId}/invite-link`)
  },
}
