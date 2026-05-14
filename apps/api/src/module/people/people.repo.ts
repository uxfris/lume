import { prisma } from "@workspace/database"

export const peopleRepo = {
  async listMembersWithUsers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    })
  },
}
