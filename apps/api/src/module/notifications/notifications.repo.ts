import { prisma } from "@workspace/database"

export const notificationsRepo = {
  findPreferences(userId: string) {
    return prisma.userNotificationPreference.findUnique({ where: { userId } })
  },

  upsertPreferences(
    userId: string,
    data: Partial<{
      pushEnabled: boolean
      meetingSummaries: boolean
      insightReports: boolean
      collaborationAlerts: boolean
    }>
  ) {
    return prisma.userNotificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled: data.pushEnabled ?? true,
        meetingSummaries: data.meetingSummaries ?? true,
        insightReports: data.insightReports ?? true,
        collaborationAlerts: data.collaborationAlerts ?? true,
      },
      update: data,
    })
  },

  listForUser(userId: string, limit: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  },

  countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    })
  },

  findById(userId: string, notificationId: string) {
    return prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })
  },

  markRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    })
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  },
}
