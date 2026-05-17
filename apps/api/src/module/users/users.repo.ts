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

  findUserDeletionState(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        scheduledDeletionAt: true,
        deletionReason: true,
      },
    })
  },

  async listSoleOwnerWorkspaces(userId: string) {
    const ownerMemberships = await prisma.workspaceMember.findMany({
      where: { userId, role: "OWNER" },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            stripeSubscriptionId: true,
          },
        },
      },
    })

    const soleOwnerWorkspaces: {
      id: string
      name: string
      stripeSubscriptionId: string | null
    }[] = []

    for (const membership of ownerMemberships) {
      const ownerCount = await prisma.workspaceMember.count({
        where: { workspaceId: membership.workspaceId, role: "OWNER" },
      })
      if (ownerCount === 1) {
        soleOwnerWorkspaces.push(membership.workspace)
      }
    }

    return soleOwnerWorkspaces
  },

  scheduleAccountDeletion(input: {
    userId: string
    scheduledDeletionAt: Date
    deletionReason: string
  }) {
    return prisma.user.update({
      where: { id: input.userId },
      data: {
        scheduledDeletionAt: input.scheduledDeletionAt,
        deletionReason: input.deletionReason,
        updatedAt: new Date(),
      },
    })
  },

  clearAccountDeletionSchedule(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        scheduledDeletionAt: null,
        deletionReason: null,
        updatedAt: new Date(),
      },
    })
  },

  deleteAllSessions(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    })
  },
}
