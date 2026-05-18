import type { NotificationType } from "@prisma/client"
import { prisma } from "./client"

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  pushEnabled: true,
  meetingSummaries: true,
  insightReports: true,
  collaborationAlerts: true,
} as const

function isTypeEnabled(
  prefs: {
    pushEnabled: boolean
    meetingSummaries: boolean
    insightReports: boolean
    collaborationAlerts: boolean
  },
  type: NotificationType
) {
  if (!prefs.pushEnabled) return false
  switch (type) {
    case "MEETING_SUMMARY":
      return prefs.meetingSummaries
    case "INSIGHT_REPORT":
      return prefs.insightReports
    case "COLLABORATION":
      return prefs.collaborationAlerts
    default:
      return false
  }
}

export async function getOrCreateNotificationPreferences(userId: string) {
  return prisma.userNotificationPreference.upsert({
    where: { userId },
    create: { userId, ...DEFAULT_NOTIFICATION_PREFERENCES },
    update: {},
  })
}

export async function deliverUserNotification(input: {
  userId: string
  type: NotificationType
  title: string
  body: string
  href?: string | null
}) {
  const prefs = await getOrCreateNotificationPreferences(input.userId)
  if (!isTypeEnabled(prefs, input.type)) return null

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    },
  })
}
