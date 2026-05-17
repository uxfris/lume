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

  findUserEmail(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
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

  listMembershipWorkspaceIds(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    })
  },

  deleteMeetingsForUserInWorkspaces(userId: string, workspaceIds: string[]) {
    if (workspaceIds.length === 0) return Promise.resolve({ count: 0 })
    return prisma.meeting.deleteMany({
      where: { userId, workspaceId: { in: workspaceIds } },
    })
  },

  deleteChannelsCreatedByUser(userId: string) {
    return prisma.channel.deleteMany({
      where: { creatorId: userId },
    })
  },

  deleteWorkspaces(workspaceIds: string[]) {
    if (workspaceIds.length === 0) return Promise.resolve({ count: 0 })
    return prisma.workspace.deleteMany({
      where: { id: { in: workspaceIds } },
    })
  },

  deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    })
  },
}
