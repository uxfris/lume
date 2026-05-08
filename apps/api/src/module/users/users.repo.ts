import { prisma } from "@workspace/database"

export const usersRepo = {
  listOAuthCalendarProviders(userId: string) {
    return prisma.account.findMany({
      where: {
        userId,
        providerId: { in: ["google", "microsoft"] },
      },
      select: { providerId: true },
    })
  },

  listMembershipsForUser(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    })
  },
}
