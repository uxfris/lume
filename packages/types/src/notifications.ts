import { z } from "zod"

export const NotificationTypeSchema = z.enum([
  "MEETING_SUMMARY",
  "INSIGHT_REPORT",
  "COLLABORATION",
])
export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationPreferencesSchema = z.object({
  pushEnabled: z.boolean(),
  meetingSummaries: z.boolean(),
  insightReports: z.boolean(),
  collaborationAlerts: z.boolean(),
})
export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>

export const UpdateNotificationPreferencesBodySchema =
  NotificationPreferencesSchema.partial()
export type UpdateNotificationPreferencesBody = z.infer<
  typeof UpdateNotificationPreferencesBodySchema
>

export const NotificationItemSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  href: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})
export type NotificationItem = z.infer<typeof NotificationItemSchema>

export const ListNotificationsResponseSchema = z.object({
  notifications: z.array(NotificationItemSchema),
  unreadCount: z.number().int().nonnegative(),
})
export type ListNotificationsResponse = z.infer<
  typeof ListNotificationsResponseSchema
>

export const UnreadCountResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
})
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>
