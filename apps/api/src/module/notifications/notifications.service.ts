import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getOrCreateNotificationPreferences,
} from "@workspace/database"
import { notificationsRepo } from "./notifications.repo"

function toPreferences(
  row: Awaited<ReturnType<typeof getOrCreateNotificationPreferences>>
) {
  return {
    pushEnabled: row.pushEnabled,
    meetingSummaries: row.meetingSummaries,
    insightReports: row.insightReports,
    collaborationAlerts: row.collaborationAlerts,
  }
}

function toNotificationItem(
  row: Awaited<ReturnType<typeof notificationsRepo.listForUser>>[number]
) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getPreferences(userId: string) {
  const row = await getOrCreateNotificationPreferences(userId)
  return toPreferences(row)
}

export async function updatePreferences(
  userId: string,
  patch: Partial<{
    pushEnabled: boolean
    meetingSummaries: boolean
    insightReports: boolean
    collaborationAlerts: boolean
  }>
) {
  const existing = await getOrCreateNotificationPreferences(userId)
  const next = {
    pushEnabled: patch.pushEnabled ?? existing.pushEnabled,
    meetingSummaries: patch.meetingSummaries ?? existing.meetingSummaries,
    insightReports: patch.insightReports ?? existing.insightReports,
    collaborationAlerts:
      patch.collaborationAlerts ?? existing.collaborationAlerts,
  }

  if (patch.pushEnabled === false) {
    next.meetingSummaries = false
    next.insightReports = false
    next.collaborationAlerts = false
  }

  const row = await notificationsRepo.upsertPreferences(userId, next)
  return toPreferences(row)
}

export async function listNotifications(userId: string, limit = 30) {
  const [notifications, unreadCount] = await Promise.all([
    notificationsRepo.listForUser(userId, limit),
    notificationsRepo.countUnread(userId),
  ])

  return {
    notifications: notifications.map(toNotificationItem),
    unreadCount,
  }
}

export async function getUnreadCount(userId: string) {
  const unreadCount = await notificationsRepo.countUnread(userId)
  return { unreadCount }
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
) {
  const { count } = await notificationsRepo.markRead(userId, notificationId)
  if (count === 0) return null
  const row = await notificationsRepo.findById(userId, notificationId)
  return row ? toNotificationItem(row) : null
}

export async function markAllNotificationsRead(userId: string) {
  await notificationsRepo.markAllRead(userId)
}

export { DEFAULT_NOTIFICATION_PREFERENCES }
