import type {
  InviteMeetingShareBody,
  InviteMeetingShareResponse,
  ListMeetingsResponse,
  LiveMeeting,
  Meeting,
  MeetingGeneralAccess,
  MeetingShareRole,
  MeetingShareState,
  UpcomingMeetingGroup,
} from "@workspace/types"
import { client, type RequestOptions } from "./client"

export const meetingApi = {
  async getLiveMeetings(options?: RequestOptions): Promise<LiveMeeting[]> {
    const res = await client.get<{ meetings: LiveMeeting[] }>(
      "/meetings/live",
      options
    )
    return res.meetings
  },
  /**
   * Cursor-paginated list; defaults match the API (`limit` 20).
   */
  async getMeetings(
    options?: {
      cursor?: string
      limit?: number
      isStarred?: boolean
      isCreatedByMe?: boolean
      isSharedWithMe?: boolean
    } & RequestOptions
  ): Promise<ListMeetingsResponse> {
    const {
      cursor,
      limit,
      isStarred,
      isCreatedByMe,
      isSharedWithMe,
      ...fetchOpts
    } = options ?? {}
    return client.get<ListMeetingsResponse>("/meetings", {
      params: {
        cursor,
        limit,
        isStarred,
        isCreatedByMe,
        isSharedWithMe,
      },
      ...fetchOpts,
    })
  },

  /** Convenience for views that only need the first page as an array. */
  async getMeetingsList(
    options?: {
      limit?: number
      isStarred?: boolean
      isCreatedByMe?: boolean
      isSharedWithMe?: boolean
    } & RequestOptions
  ): Promise<Meeting[]> {
    const { limit, isStarred, isCreatedByMe, isSharedWithMe, ...fetchOpts } =
      options ?? {}
    const res = await meetingApi.getMeetings({
      limit: limit ?? 50,
      isStarred,
      isCreatedByMe,
      isSharedWithMe,
      ...fetchOpts,
    })
    return res.meetings
  },

  async getUpcomingMeetings(
    options?: RequestOptions
  ): Promise<UpcomingMeetingGroup[]> {
    return client.get<UpcomingMeetingGroup[]>("/calendar/upcoming", options)
  },

  async getMeeting(id: string, options?: RequestOptions): Promise<Meeting> {
    return client.get<Meeting>(`/meetings/${id}`, options)
  },

  async updateMeeting(
    id: string,
    body: { title?: string; isShared?: boolean; isStarred?: boolean },
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(`/meetings/${id}`, body, options)
  },

  async deleteMeeting(id: string, options?: RequestOptions): Promise<void> {
    await client.delete(`/meetings/${id}`, options)
  },

  async deleteMeetings(
    meetingIds: string[],
    options?: RequestOptions
  ): Promise<void> {
    await client.delete("/meetings", { ...options, body: { meetingIds } })
  },

  async moveToWorkspace(
    targetWorkspaceId: string,
    meetingIds: string[],
    options?: RequestOptions
  ): Promise<void> {
    await client.post(
      "/meetings/move-to-workspace",
      { targetWorkspaceId, meetingIds },
      options
    )
  },

  async unstarMeetings(
    meetingIds: string[],
    options?: RequestOptions
  ): Promise<void> {
    await client.post("/meetings/unstar", { meetingIds }, options)
  },

  async getMeetingShare(
    meetingId: string,
    options?: RequestOptions
  ): Promise<MeetingShareState> {
    return client.get<MeetingShareState>(`/meetings/${meetingId}/share`, options)
  },

  async inviteToMeeting(
    meetingId: string,
    body: InviteMeetingShareBody,
    options?: RequestOptions
  ): Promise<InviteMeetingShareResponse> {
    return client.post<InviteMeetingShareResponse>(
      `/meetings/${meetingId}/share/invites`,
      body,
      options
    )
  },

  async updateMeetingShareRole(
    meetingId: string,
    shareId: string,
    role: MeetingShareRole,
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(
      `/meetings/${meetingId}/share/invites/${shareId}`,
      { role },
      options
    )
  },

  async revokeMeetingShare(
    meetingId: string,
    shareId: string,
    options?: RequestOptions
  ): Promise<void> {
    await client.delete(
      `/meetings/${meetingId}/share/invites/${shareId}`,
      options
    )
  },

  async updateMeetingGeneralAccess(
    meetingId: string,
    generalAccess: MeetingGeneralAccess,
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(
      `/meetings/${meetingId}/share/access`,
      { generalAccess },
      options
    )
  },
}
