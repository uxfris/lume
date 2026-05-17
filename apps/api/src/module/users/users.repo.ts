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

  updateProfile(
    userId: string,
    data: { name?: string; image?: string | null }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })
  },
}
