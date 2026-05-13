import { client, type RequestOptions } from "./client"
import type { Channel, ChannelType, Meeting } from "@workspace/types"

export const channelApi = {
  async createChannel(
    body: { name: string; description?: string | null; type?: ChannelType },
    options?: RequestOptions
  ): Promise<Channel> {
    const res = await client.post<{ channel: Channel }>(
      "/channels",
      body,
      options
    )
    return res.channel
  },

  async getChannels(options?: RequestOptions): Promise<Channel[]> {
    const res = await client.get<{ channels: Channel[] }>("/channels", options)
    return res.channels
  },

  async getChannel(id: string, options?: RequestOptions): Promise<Channel> {
    return client.get<Channel>(`/channels/${id}`, options)
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
  ): Promise<Meeting[]> {
    const { limit, ...fetchOpts } = options ?? {}
    const res = await client.get<{ meetings: Meeting[] }>(
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
    meetingIds: string[],
    options?: RequestOptions
  ): Promise<{ updatedCount: number }> {
    return client.delete<{ updatedCount: number }>(`/channels/${id}/meetings`, {
      ...options,
      body: meetingIds,
    })
  },
}
