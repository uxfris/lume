import {
  ListNotificationsResponseSchema,
  NotificationItemSchema,
  NotificationPreferencesSchema,
  UnreadCountResponseSchema,
  type ListNotificationsResponse,
  type NotificationItem,
  type NotificationPreferences,
  type UpdateNotificationPreferencesBody,
} from "@workspace/types"
import { client, RequestOptions } from "./client"

export const notificationsApi = {
  async getPreferences(
    options?: RequestOptions
  ): Promise<NotificationPreferences> {
    const data = await client.get<unknown>("/notifications/preferences", options)
    return NotificationPreferencesSchema.parse(data)
  },

  async updatePreferences(
    body: UpdateNotificationPreferencesBody,
    options?: RequestOptions
  ): Promise<NotificationPreferences> {
    const data = await client.patch<unknown>(
      "/notifications/preferences",
      body,
      options
    )
    return NotificationPreferencesSchema.parse(data)
  },

  async list(
    params?: { limit?: number },
    options?: RequestOptions
  ): Promise<ListNotificationsResponse> {
    const data = await client.get<unknown>("/notifications", {
      ...options,
      params: { limit: params?.limit },
    })
    return ListNotificationsResponseSchema.parse(data)
  },

  async getUnreadCount(options?: RequestOptions): Promise<number> {
    const data = await client.get<unknown>(
      "/notifications/unread-count",
      options
    )
    return UnreadCountResponseSchema.parse(data).unreadCount
  },

  async markRead(
    notificationId: string,
    options?: RequestOptions
  ): Promise<NotificationItem> {
    const data = await client.post<unknown>(
      `/notifications/${notificationId}/read`,
      {},
      options
    )
    return NotificationItemSchema.parse(data)
  },

  async markAllRead(options?: RequestOptions): Promise<void> {
    await client.post<unknown>("/notifications/read-all", {}, options)
  },
}
