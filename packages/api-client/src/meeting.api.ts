import type { Meeting, UpcomingMeetingGroup } from "@workspace/types"
import { client, type RequestOptions } from "./client"

type ListMeetingsResponse = {
  meetings: Meeting[]
  nextCursor: string | null
}

export const meetingApi = {
  /**
   * Cursor-paginated list; defaults match the API (`limit` 20).
   */
  async getMeetings(
    options?: {
      cursor?: string
      limit?: number
    } & RequestOptions
  ): Promise<ListMeetingsResponse> {
    const { cursor, limit, ...fetchOpts } = options ?? {}
    return client.get<ListMeetingsResponse>("/meetings", {
      params: {
        cursor,
        limit,
      },
      ...fetchOpts,
    })
  },

  /** Convenience for views that only need the first page as an array. */
  async getMeetingsList(
    options?: { limit?: number } & RequestOptions
  ): Promise<Meeting[]> {
    const { limit, ...fetchOpts } = options ?? {}
    const res = await meetingApi.getMeetings({
      limit: limit ?? 50,
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
    body: { title?: string; isShared?: boolean },
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(`/meetings/${id}`, body, options)
  },

  async deleteMeeting(id: string, options?: RequestOptions): Promise<void> {
    await client.delete(`/meetings/${id}`, options)
  },
}
