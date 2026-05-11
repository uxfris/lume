import { client, type RequestOptions } from "./client"
import type { Channel, ChannelMeeting, ChannelType } from "@workspace/types"

export const channelApi = {
  async getChannels(options?: RequestOptions): Promise<Channel[]> {
    const res = await client.get<{ channels: Channel[] }>("/channels", options)
    return res.channels
  },

  async updateChannel(
    id: string,
    body: { name?: string; description?: string | null; type?: ChannelType },
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(`/channels/${id}`, body, options)
  },

  async deleteChannel(id: string, options?: RequestOptions): Promise<void> {
    await client.delete(`/channels/${id}`, options)
  },

  async getChannelMeetings(
    id: string,
    options?: { limit?: number } & RequestOptions
  ): Promise<ChannelMeeting[]> {
    const { limit, ...fetchOpts } = options ?? {}
    const res = await client.get<{ meetings: ChannelMeeting[] }>(
      `/channels/${id}/meetings`,
      {
        params: { limit },
        ...fetchOpts,
      }
    )
    return res.meetings
  },

  async addMeetingsToChannel(
    id: string,
    meetingIds: string[],
    options?: RequestOptions
  ): Promise<{ updatedCount: number }> {
    return client.post<{ updatedCount: number }>(
      `/channels/${id}/meetings`,
      { meetingIds },
      options
    )
  },

  async removeMeetingsFromChannel(
    id: string,
    meetingIds?: string[],
    options?: RequestOptions
  ): Promise<{ updatedCount: number }> {
    return client.delete<{ updatedCount: number }>(`/channels/${id}/meetings`, {
      ...options,
      body: meetingIds ? { meetingIds } : undefined,
    })
  },
}
